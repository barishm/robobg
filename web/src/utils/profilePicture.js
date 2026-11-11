// Profile pictures have no backend yet, so they're kept in a cookie per user.
// A cookie holds ~4KB (name + value), so the uploaded image is downscaled and
// re-encoded as a small JPEG until its base64 fits. Only the base64 payload is
// stored: the "data:image/jpeg;base64," prefix contains ";" and ",", which
// aren't allowed in cookie values, while base64's own characters are.

const COOKIE_PREFIX = 'robobg_avatar_';
const MAX_COOKIE_VALUE_LENGTH = 3800;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const SIZES = [96, 80, 64, 48];
const QUALITIES = [0.85, 0.7, 0.55, 0.4];
const DATA_URL_PREFIX = 'data:image/jpeg;base64,';

const cookieName = (username) => COOKIE_PREFIX + encodeURIComponent(username);

export const getProfilePicture = (username) => {
  if (!username) return null;
  const name = cookieName(username) + '=';
  const entry = document.cookie.split('; ').find((c) => c.startsWith(name));
  const value = entry?.slice(name.length);
  return value ? DATA_URL_PREFIX + value : null;
};

export const removeProfilePicture = (username) => {
  if (!username) return;
  document.cookie = `${cookieName(username)}=; path=/; max-age=0; SameSite=Lax`;
};

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });

// Center-crops to a square so the avatar circle isn't distorted.
const encodeSquare = (img, size, quality) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  // JPEG has no alpha; paint white under transparent PNGs instead of black.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', quality);
};

// Resizes the file, stores it in the user's cookie and returns the data URL.
export const saveProfilePicture = async (username, file) => {
  if (!username) throw new Error('No user');
  if (!file?.type?.startsWith('image/')) throw new Error('Not an image');

  const img = await loadImage(file);
  for (const size of SIZES) {
    for (const quality of QUALITIES) {
      const dataUrl = encodeSquare(img, size, quality);
      const value = dataUrl.slice(DATA_URL_PREFIX.length);
      if (value.length <= MAX_COOKIE_VALUE_LENGTH) {
        document.cookie = `${cookieName(username)}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
        return dataUrl;
      }
    }
  }
  throw new Error('Image too large');
};
