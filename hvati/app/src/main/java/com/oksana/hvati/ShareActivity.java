package com.oksana.hvati;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ShareActivity extends Activity {
    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");

    private String sharedUrl;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        sharedUrl = extractUrl(getIntent().getStringExtra(Intent.EXTRA_TEXT));
        if (sharedUrl == null) {
            finish();
            return;
        }
        showModePicker();
    }

    private void showModePicker() {
        List<String> modes = smartModes(sharedUrl);
        String[] labels = new String[modes.size()];
        for (int i = 0; i < modes.size(); i++) labels[i] = labelFor(modes.get(i));

        new AlertDialog.Builder(this)
                .setTitle("Хвать")
                .setItems(labels, (dialog, which) -> {
                    String mode = modes.get(which);
                    getSharedPreferences("hvati_prefs", MODE_PRIVATE)
                            .edit().putString("last_mode", mode).apply();
                    DownloadService.enqueue(this, sharedUrl, mode);
                    finish();
                })
                .setOnCancelListener(dialog -> finish())
                .show();
    }

    private List<String> smartModes(String url) {
        String lower = url.toLowerCase(Locale.ROOT);
        boolean directImage = lower.matches(".*\\.(jpg|jpeg|png|webp|gif|avif|heic)(\\?.*)?$");
        boolean instagramPost = lower.contains("instagram.com/p/");
        boolean instagramReel = lower.contains("instagram.com/reel/");

        if (directImage || instagramPost) {
            return Arrays.asList("images", "720", "mp3");
        }

        SharedPreferences prefs = getSharedPreferences("hvati_prefs", MODE_PRIVATE);
        String last = prefs.getString("last_mode", "720");
        ArrayList<String> modes = new ArrayList<>(Arrays.asList("720", "480", "1080", "240", "mp3"));
        if (instagramReel) modes.remove("1080");
        if (modes.remove(last)) modes.add(0, last);
        return modes;
    }

    private String labelFor(String mode) {
        switch (mode) {
            case "240": return "240P · эконом";
            case "480": return "480P";
            case "720": return "720P";
            case "1080": return "1080P";
            case "mp3": return "MP3";
            case "images": return "Фото / карусель · всё";
            default: return mode;
        }
    }

    private String extractUrl(String text) {
        if (text == null) return null;
        Matcher m = URL_PATTERN.matcher(text);
        if (!m.find()) return null;
        String url = m.group();
        while (url.endsWith(")") || url.endsWith("]") || url.endsWith("}") ||
                url.endsWith(",") || url.endsWith(".") || url.endsWith(";")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }
}
