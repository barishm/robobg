package com.robobg.service.impl;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Finds hashtags (#Dog, #Почистване, #S8_Pro) in an offer's text. Keep in
// sync with HASHTAG_REGEX in web/src/features/home-page-feature/offerTextMarkup.jsx.
// - "#" must not follow a letter, digit, "_", "/", "&" or "#", so URL
//   fragments (page#top), HTML entities and "##" are not hashtags
// - the tag needs at least one letter, so "#1" is not a hashtag
// - the title line "# Title" has a space after "#", so it's not a hashtag
public final class OfferHashtags {

    public static final int MAX_LENGTH = 100;

    private static final Pattern HASHTAG = Pattern.compile(
            "(?<![\\p{L}\\p{N}_/&#])#([\\p{L}\\p{N}_]*\\p{L}[\\p{L}\\p{N}_]*)",
            Pattern.UNICODE_CHARACTER_CLASS);

    private OfferHashtags() {
    }

    public static String normalize(String name) {
        return name.toLowerCase(Locale.ROOT);
    }

    // normalized name -> name as first written, in order of appearance
    public static Map<String, String> extract(String text) {
        Map<String, String> tags = new LinkedHashMap<>();
        if (text == null) {
            return tags;
        }
        Matcher matcher = HASHTAG.matcher(text);
        while (matcher.find()) {
            String name = matcher.group(1);
            if (name.length() <= MAX_LENGTH) {
                tags.putIfAbsent(normalize(name), name);
            }
        }
        return tags;
    }
}
