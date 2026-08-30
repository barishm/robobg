package com.robobg.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final String OUTPUT_FORMAT = "jpg";
    private static final float COMPRESSION_QUALITY = 0.75f;

    private final Path storageDir = Paths.get("/files");

    public String storeRobotImage(Long robotId, MultipartFile file) throws IOException {

        validateImage(file);

        byte[] bytes = file.getBytes();
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(bytes));
        if (original == null) {
            throw new IllegalArgumentException("File is not a valid image");
        }
        original = applyExifOrientation(original, getExifOrientation(bytes));

        BufferedImage processed = cropAndResizeToSquare(original, 600);

        String fileName = generateFileName("Robot",robotId);
        Path outputPath = storageDir.resolve(fileName);

        Files.createDirectories(outputPath.getParent());

        writeJpeg(processed, outputPath, COMPRESSION_QUALITY);

        return fileName;
    }

    public List<String> storeConsumablesImages(Long consumableId, List<MultipartFile> files) throws IOException {

        List<String> savedFiles = new ArrayList<>();


        for (MultipartFile file : files) {
            try {
                validateImage(file);

                byte[] bytes = file.getBytes();
                BufferedImage original = ImageIO.read(new ByteArrayInputStream(bytes));
                if (original == null) {
                    throw new IllegalArgumentException("Invalid image file: " + file.getOriginalFilename());
                }
                original = applyExifOrientation(original, getExifOrientation(bytes));

                BufferedImage processed = cropAndResizeToSquare(original, 600);

                String fileName = generateFileName("Consumable", consumableId);

                Path outputPath = storageDir.resolve(fileName);
                Files.createDirectories(outputPath.getParent());

                writeJpeg(processed, outputPath, 0.75f);

                savedFiles.add(fileName);
            } catch (Exception e) {
                logger.error("Failed to process consumable image '{}' ({} bytes, type={}) for consumableId {}: {}",
                        file.getOriginalFilename(), file.getSize(), file.getContentType(), consumableId, e.getMessage());
                throw e;
            }
        }

        return savedFiles;
    }

    // -------------------- VALIDATION --------------------

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Empty file");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit, matches nginx client_max_body_size / Spring max-file-size
            throw new IllegalArgumentException("File too large (max 10MB)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported image type: " + contentType);
        }
    }

    // -------------------- EXIF ORIENTATION --------------------

    // Reads the EXIF "Orientation" tag (if any) directly from the JPEG APP1 segment.
    // ImageIO.read() ignores this tag, so without it, photos taken in portrait on a
    // phone (stored as landscape pixels + an orientation flag) get processed unrotated.
    private int getExifOrientation(byte[] imageBytes) {
        if (imageBytes.length < 4 || (imageBytes[0] & 0xFF) != 0xFF || (imageBytes[1] & 0xFF) != 0xD8) {
            return 1;
        }

        int offset = 2;
        while (offset + 3 < imageBytes.length) {
            if ((imageBytes[offset] & 0xFF) != 0xFF) {
                break;
            }
            int marker = imageBytes[offset + 1] & 0xFF;
            offset += 2;

            if (marker == 0xD8 || marker == 0xD9) {
                continue;
            }
            if (marker == 0xDA) { // Start of Scan - no more metadata segments follow
                break;
            }

            int segmentLength = readInt16(imageBytes, offset, false);

            if (marker == 0xE1) { // APP1 - EXIF
                int exifStart = offset + 2;
                if (exifStart + 6 <= imageBytes.length
                        && imageBytes[exifStart] == 'E' && imageBytes[exifStart + 1] == 'x'
                        && imageBytes[exifStart + 2] == 'i' && imageBytes[exifStart + 3] == 'f') {
                    return parseExifOrientation(imageBytes, exifStart + 6);
                }
            }

            offset += segmentLength;
        }

        return 1;
    }

    private int parseExifOrientation(byte[] data, int tiffStart) {
        if (tiffStart + 8 > data.length) {
            return 1;
        }

        boolean littleEndian;
        if (data[tiffStart] == 'I' && data[tiffStart + 1] == 'I') {
            littleEndian = true;
        } else if (data[tiffStart] == 'M' && data[tiffStart + 1] == 'M') {
            littleEndian = false;
        } else {
            return 1;
        }

        int firstIfdOffset = readInt32(data, tiffStart + 4, littleEndian);
        int ifdOffset = tiffStart + firstIfdOffset;
        if (ifdOffset + 2 > data.length) {
            return 1;
        }

        int entryCount = readInt16(data, ifdOffset, littleEndian);
        for (int i = 0; i < entryCount; i++) {
            int entryOffset = ifdOffset + 2 + (i * 12);
            if (entryOffset + 12 > data.length) {
                break;
            }
            int tag = readInt16(data, entryOffset, littleEndian);
            if (tag == 0x0112) { // Orientation
                return readInt16(data, entryOffset + 8, littleEndian);
            }
        }

        return 1;
    }

    private int readInt16(byte[] data, int offset, boolean littleEndian) {
        if (littleEndian) {
            return (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8);
        }
        return ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
    }

    private int readInt32(byte[] data, int offset, boolean littleEndian) {
        if (littleEndian) {
            return (data[offset] & 0xFF) | ((data[offset + 1] & 0xFF) << 8)
                    | ((data[offset + 2] & 0xFF) << 16) | ((data[offset + 3] & 0xFF) << 24);
        }
        return ((data[offset] & 0xFF) << 24) | ((data[offset + 1] & 0xFF) << 16)
                | ((data[offset + 2] & 0xFF) << 8) | (data[offset + 3] & 0xFF);
    }

    // Rotates/flips the image according to the EXIF orientation value (1-8) so the
    // pixel buffer matches how the photo was actually displayed on the source device.
    private BufferedImage applyExifOrientation(BufferedImage image, int orientation) {
        if (orientation <= 1 || orientation > 8) {
            return image;
        }

        int width = image.getWidth();
        int height = image.getHeight();

        AffineTransform t = new AffineTransform();
        switch (orientation) {
            case 2 -> { // flip horizontal
                t.scale(-1.0, 1.0);
                t.translate(-width, 0);
            }
            case 3 -> { // rotate 180
                t.translate(width, height);
                t.rotate(Math.PI);
            }
            case 4 -> { // flip vertical
                t.scale(1.0, -1.0);
                t.translate(0, -height);
            }
            case 5 -> { // transpose
                t.rotate(-Math.PI / 2);
                t.scale(-1.0, 1.0);
            }
            case 6 -> { // rotate 90 CW
                t.translate(height, 0);
                t.rotate(Math.PI / 2);
            }
            case 7 -> { // transverse
                t.scale(-1.0, 1.0);
                t.translate(-height, 0);
                t.translate(0, width);
                t.rotate(3 * Math.PI / 2);
            }
            case 8 -> { // rotate 90 CCW
                t.translate(0, width);
                t.rotate(3 * Math.PI / 2);
            }
            default -> {
            }
        }

        boolean swapDims = orientation >= 5;
        int newWidth = swapDims ? height : width;
        int newHeight = swapDims ? width : height;

        BufferedImage rotated = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = rotated.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2d.drawImage(image, t, null);
        g2d.dispose();

        return rotated;
    }

    // -------------------- RESIZING --------------------

    private BufferedImage cropAndResizeToSquare(BufferedImage original, int size) {

        int width = original.getWidth();
        int height = original.getHeight();

        // 1. Crop to square (center crop)
        int squareSize = Math.min(width, height);

        int x = (width - squareSize) / 2;
        int y = (height - squareSize) / 2;

        BufferedImage cropped = original.getSubimage(x, y, squareSize, squareSize);

        // 2. Convert to RGB (important for JPEG)
        BufferedImage rgb = toRGB(cropped);

        // 3. Resize to 600x600
        BufferedImage resized = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);

        Graphics2D g2d = resized.createGraphics();
        g2d.setRenderingHint(
                RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BICUBIC
        );
        g2d.drawImage(rgb, 0, 0, size, size, null);
        g2d.dispose();

        return resized;
    }

    // Convert any format (PNG/WebP) → RGB (needed for JPEG)
    private BufferedImage toRGB(BufferedImage image) {
        BufferedImage rgb = new BufferedImage(
                image.getWidth(),
                image.getHeight(),
                BufferedImage.TYPE_INT_RGB
        );

        Graphics2D g = rgb.createGraphics();
        g.drawImage(image, 0, 0, null);
        g.dispose();

        return rgb;
    }

    // -------------------- COMPRESSION --------------------

    private void writeJpeg(BufferedImage image, Path outputPath, float quality) throws IOException {

        ImageWriter writer = ImageIO.getImageWritersByFormatName(OUTPUT_FORMAT).next();

        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(quality);

        try (OutputStream os = Files.newOutputStream(outputPath);
             var ios = ImageIO.createImageOutputStream(os)) {

            writer.setOutput(ios);
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
    }

    // -------------------- FILE NAMING --------------------

    private String generateFileName(String name,Long Id) {

        return "%s_%d_%d.%s"
                .formatted(name, Id, Instant.now().toEpochMilli(), OUTPUT_FORMAT);
    }
}