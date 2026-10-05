package com.oksana.hvati;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.chaquo.python.PyObject;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;
import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.FFmpegSession;
import com.arthenica.ffmpegkit.ReturnCode;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {

    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");

    private EditText urlBox;
    private TextView status;
    private TextView percentText;
    private TextView progressDetails;
    private ProgressBar progressBar;
    private volatile boolean downloading = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (!Python.isStarted()) {
            Python.start(new AndroidPlatform(this));
        }

        buildUi();
        consumeIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        consumeIntent(intent);
    }

    private void buildUi() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(14, 16, 20));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(22), dp(28), dp(22), dp(28));
        scroll.addView(root, new ScrollView.LayoutParams(
                ScrollView.LayoutParams.MATCH_PARENT,
                ScrollView.LayoutParams.WRAP_CONTENT));

        TextView title = new TextView(this);
        title.setText("Хвать  ·  v0.9.1");
        title.setTextSize(32);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setTextColor(Color.rgb(242, 245, 248));
        root.addView(title);

        urlBox = new EditText(this);
        urlBox.setHint("Вставь ссылку");
        urlBox.setTextSize(16);
        urlBox.setSingleLine(false);
        urlBox.setMinLines(2);
        urlBox.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        urlBox.setTextColor(Color.rgb(242, 245, 248));
        urlBox.setHintTextColor(Color.rgb(125, 135, 148));
        urlBox.setBackgroundColor(Color.rgb(28, 32, 39));
        urlBox.setPadding(dp(14), dp(12), dp(14), dp(12));
        LinearLayout.LayoutParams urlLp = lp();
        urlLp.topMargin = dp(22);
        root.addView(urlBox, urlLp);

        TextView choose = new TextView(this);
        choose.setText("Формат");
        choose.setTextSize(18);
        choose.setTypeface(Typeface.DEFAULT_BOLD);
        choose.setTextColor(Color.rgb(242, 245, 248));
        LinearLayout.LayoutParams chooseLp = lp();
        chooseLp.topMargin = dp(24);
        root.addView(choose, chooseLp);

        root.addView(makeButton("480P", "480"));
        root.addView(makeButton("720P", "720"));
        root.addView(makeButton("1080P", "1080"));
        root.addView(makeButton("MP3", "mp3"));
        root.addView(makeButton("Фото / карусель", "images"));

        LinearLayout progressRow = new LinearLayout(this);
        progressRow.setOrientation(LinearLayout.HORIZONTAL);
        progressRow.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams rowLp = lp();
        rowLp.topMargin = dp(24);
        root.addView(progressRow, rowLp);

        progressBar = new ProgressBar(
                this,
                null,
                android.R.attr.progressBarStyleHorizontal
        );
        progressBar.setMax(100);
        progressBar.setProgress(0);
        progressBar.setIndeterminate(false);
        LinearLayout.LayoutParams barLp = new LinearLayout.LayoutParams(0, dp(12), 1f);
        progressRow.addView(progressBar, barLp);

        percentText = new TextView(this);
        percentText.setText("0%");
        percentText.setTextSize(18);
        percentText.setTypeface(Typeface.DEFAULT_BOLD);
        percentText.setTextColor(Color.rgb(242, 245, 248));
        percentText.setGravity(Gravity.END);
        LinearLayout.LayoutParams pctLp = new LinearLayout.LayoutParams(dp(72), LinearLayout.LayoutParams.WRAP_CONTENT);
        pctLp.leftMargin = dp(12);
        progressRow.addView(percentText, pctLp);

        status = new TextView(this);
        status.setText("Готов");
        status.setTextSize(15);
        status.setTextColor(Color.rgb(150, 160, 174));
        LinearLayout.LayoutParams stLp = lp();
        stLp.topMargin = dp(12);
        root.addView(status, stLp);

        progressDetails = new TextView(this);
        progressDetails.setText("");
        progressDetails.setTextSize(13);
        progressDetails.setTextColor(Color.rgb(125, 135, 148));
        LinearLayout.LayoutParams detLp = lp();
        detLp.topMargin = dp(4);
        root.addView(progressDetails, detLp);

        setContentView(scroll);
    }

    private Button makeButton(String label, String mode) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setText(label);
        b.setTextSize(16);
        b.setTextColor(Color.rgb(242, 245, 248));
        b.setBackgroundColor(Color.rgb(34, 39, 47));
        b.setOnClickListener(v -> startDownload(mode));
        LinearLayout.LayoutParams p = lp();
        p.topMargin = dp(10);
        b.setLayoutParams(p);
        return b;
    }

    private LinearLayout.LayoutParams lp() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void consumeIntent(Intent intent) {
        if (intent == null) return;
        if (Intent.ACTION_SEND.equals(intent.getAction()) && "text/plain".equals(intent.getType())) {
            String text = intent.getStringExtra(Intent.EXTRA_TEXT);
            String url = extractUrl(text);
            if (url != null) urlBox.setText(url);
        }
    }

    private String extractUrl(String text) {
        if (text == null) return null;
        Matcher m = URL_PATTERN.matcher(text);
        if (!m.find()) return text.trim();

        String url = m.group();
        while (url.endsWith(")") || url.endsWith("]") || url.endsWith("}") ||
                url.endsWith(",") || url.endsWith(".") || url.endsWith(";")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    private void startDownload(String mode) {
        if (downloading) {
            Toast.makeText(this, "Загрузка уже идёт", Toast.LENGTH_SHORT).show();
            return;
        }

        String url = extractUrl(urlBox.getText().toString());
        if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) {
            Toast.makeText(this, "Нужна ссылка", Toast.LENGTH_SHORT).show();
            return;
        }

        downloading = true;
        progressBar.setIndeterminate(false);
        progressBar.setProgress(0);
        percentText.setText("0%");
        status.setText("Подключение…");
        progressDetails.setText("");

        File progressFile = new File(getCacheDir(), "yt_progress.txt");
        if (progressFile.exists()) progressFile.delete();

        new Thread(() -> pollProgress(progressFile)).start();

        new Thread(() -> {
            try {
                File workDir = new File(getCacheDir(), "yt_downloads");
                if (!workDir.exists() && !workDir.mkdirs()) {
                    throw new IllegalStateException("Не удалось создать временную папку");
                }

                Python py = Python.getInstance();
                PyObject result;

                if ("images".equals(mode)) {
                    PyObject module = py.getModule("image_downloader");
                    result = module.callAttr(
                            "download_images",
                            url,
                            workDir.getAbsolutePath(),
                            progressFile.getAbsolutePath()
                    );
                } else {
                    PyObject module = py.getModule("downloader");
                    result = module.callAttr(
                            "download",
                            url,
                            mode,
                            workDir.getAbsolutePath(),
                            progressFile.getAbsolutePath()
                    );
                }

                String payload = result.toJava(String.class);
                JSONObject json = new JSONObject(payload);
                String kind = json.getString("kind");
                String outputName = json.optString("output_name", "download");

                if ("gallery".equals(kind)) {
                    JSONArray files = json.getJSONArray("files");
                    int count = files.length();

                    if (count == 0) {
                        throw new IllegalStateException("Карусель пустая");
                    }

                    for (int i = 0; i < count; i++) {
                        File galleryFile = new File(files.getString(i));
                        int itemNumber = i + 1;
                        int progress = 90 + (int) Math.floor((itemNumber - 1) * 9.0 / count);

                        runOnUiThread(() -> {
                            progressBar.setIndeterminate(false);
                            progressBar.setProgress(progress);
                            percentText.setText(progress + "%");
                            status.setText("Сохраняю карусель…");
                            progressDetails.setText(itemNumber + " / " + count + " · " + galleryFile.getName());
                        });

                        saveToDownloads(galleryFile, false);
                    }

                    downloading = false;
                    runOnUiThread(() -> {
                        progressBar.setIndeterminate(false);
                        progressBar.setProgress(100);
                        percentText.setText("100%");
                        status.setText("Готово");
                        progressDetails.setText("Сохранено файлов: " + count);
                        Toast.makeText(this, "Сохранено файлов: " + count, Toast.LENGTH_LONG).show();
                    });
                    return;
                }

                File outputFile;

                if ("mp3".equals(kind)) {
                    File sourceFile = new File(json.getString("source"));

                    runOnUiThread(() -> {
                        progressBar.setIndeterminate(false);
                        progressBar.setProgress(94);
                        percentText.setText("94%");
                        status.setText("Конвертирую в MP3…");
                        progressDetails.setText(sourceFile.getName());
                    });

                    outputFile = convertToMp3(sourceFile, workDir, outputName);

                } else if ("merge".equals(kind)) {
                    File videoFile = new File(json.getString("video"));
                    File audioFile = new File(json.getString("audio"));

                    runOnUiThread(() -> {
                        progressBar.setIndeterminate(false);
                        progressBar.setProgress(95);
                        percentText.setText("95%");
                        status.setText("Склеиваю видео и звук…");
                        progressDetails.setText("");
                    });

                    outputFile = mergeVideoAudio(videoFile, audioFile, workDir, outputName);

                } else {
                    outputFile = new File(json.getString("source"));
                }

                File fileToSave = outputFile;
                runOnUiThread(() -> {
                    progressBar.setIndeterminate(false);
                    progressBar.setProgress(98);
                    percentText.setText("98%");
                    status.setText("Сохраняю в Downloads…");
                    progressDetails.setText(fileToSave.getName());
                });

                saveToDownloads(fileToSave);

                downloading = false;
                runOnUiThread(() -> {
                    progressBar.setIndeterminate(false);
                    progressBar.setProgress(100);
                    percentText.setText("100%");
                    status.setText("Готово 😏");
                    progressDetails.setText(fileToSave.getName());
                    Toast.makeText(this, "Сохранено в Downloads", Toast.LENGTH_LONG).show();
                });

            } catch (Throwable e) {
                downloading = false;
                String message = e.getMessage();
                if (message == null || message.trim().isEmpty()) {
                    message = e.getClass().getSimpleName();
                }
                String finalMessage = message;
                runOnUiThread(() -> {
                    progressBar.setIndeterminate(false);
                    progressBar.setProgress(0);
                    percentText.setText("—");
                    status.setText("Ошибка");
                    progressDetails.setText(finalMessage);
                    Toast.makeText(this, "Скачивание не удалось", Toast.LENGTH_LONG).show();
                });
            }
        }).start();
    }

    private void pollProgress(File progressFile) {
        String lastLine = "";

        while (downloading) {
            try {
                if (progressFile.exists()) {
                    String line;
                    try (BufferedReader reader = new BufferedReader(new FileReader(progressFile))) {
                        line = reader.readLine();
                    }

                    if (line != null && !line.equals(lastLine)) {
                        lastLine = line;
                        String[] parts = line.split("\\t", -1);
                        if (parts.length >= 6) {
                            int percent = Integer.parseInt(parts[0]);
                            String stage = parts[1];
                            long downloadedBytes = Long.parseLong(parts[2]);
                            long totalBytes = Long.parseLong(parts[3]);
                            long speed = Long.parseLong(parts[4]);
                            long eta = Long.parseLong(parts[5]);

                            runOnUiThread(() -> applyProgress(
                                    percent,
                                    stage,
                                    downloadedBytes,
                                    totalBytes,
                                    speed,
                                    eta
                            ));
                        }
                    }
                }

                Thread.sleep(180);
            } catch (Throwable ignored) {
                try {
                    Thread.sleep(250);
                } catch (InterruptedException ignoredAgain) {
                    return;
                }
            }
        }
    }

    private void applyProgress(
            int percent,
            String stage,
            long downloadedBytes,
            long totalBytes,
            long speed,
            long eta
    ) {
        status.setText(stage);

        if (percent >= 0) {
            progressBar.setIndeterminate(false);
            progressBar.setProgress(percent);
            percentText.setText(percent + "%");
        } else {
            progressBar.setIndeterminate(true);
            percentText.setText("…");
        }

        StringBuilder details = new StringBuilder();

        if (downloadedBytes > 0) {
            details.append(formatBytes(downloadedBytes));
        }

        if (totalBytes > 0) {
            if (details.length() > 0) details.append(" / ");
            details.append(formatBytes(totalBytes));
        }

        if (speed > 0) {
            if (details.length() > 0) details.append(" · ");
            details.append(formatBytes(speed)).append("/с");
        }

        if (eta >= 0) {
            if (details.length() > 0) details.append(" · ");
            details.append("ещё ~").append(formatEta(eta));
        }

        progressDetails.setText(details.toString());
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " Б";
        double kb = bytes / 1024.0;
        if (kb < 1024) return String.format(Locale.getDefault(), "%.1f КБ", kb);
        double mb = kb / 1024.0;
        if (mb < 1024) return String.format(Locale.getDefault(), "%.1f МБ", mb);
        return String.format(Locale.getDefault(), "%.2f ГБ", mb / 1024.0);
    }

    private String formatEta(long seconds) {
        if (seconds < 60) return seconds + " с";
        long minutes = seconds / 60;
        long rest = seconds % 60;
        return minutes + " мин " + rest + " с";
    }

    private File convertToMp3(File source, File workDir, String outputName) throws Exception {
        String safeName = outputName.endsWith(".mp3") ? outputName : outputName + ".mp3";
        File target = new File(workDir, safeName);

        if (target.exists() && !target.delete()) {
            throw new IllegalStateException("Не удалось заменить старый временный MP3");
        }

        String[] arguments = new String[] {
                "-y",
                "-i", source.getAbsolutePath(),
                "-vn",
                "-map_metadata", "0",
                "-codec:a", "libmp3lame",
                "-q:a", "2",
                target.getAbsolutePath()
        };

        FFmpegSession session = FFmpegKit.executeWithArguments(arguments);

        if (!ReturnCode.isSuccess(session.getReturnCode()) ||
                !target.exists() ||
                target.length() == 0) {
            throw new IllegalStateException("FFmpeg не смог собрать MP3");
        }

        return target;
    }

    private File mergeVideoAudio(
            File video,
            File audio,
            File workDir,
            String outputName
    ) throws Exception {
        String safeName = outputName.endsWith(".mp4") ? outputName : outputName + ".mp4";
        File target = new File(workDir, safeName);

        if (target.exists() && !target.delete()) {
            throw new IllegalStateException("Не удалось заменить старый временный MP4");
        }

        String[] arguments = new String[] {
                "-y",
                "-i", video.getAbsolutePath(),
                "-i", audio.getAbsolutePath(),
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-c:v", "copy",
                "-c:a", "aac",
                "-b:a", "192k",
                "-movflags", "+faststart",
                target.getAbsolutePath()
        };

        FFmpegSession session = FFmpegKit.executeWithArguments(arguments);

        if (ReturnCode.isSuccess(session.getReturnCode()) &&
                target.exists() &&
                target.length() > 0) {
            return target;
        }

        File mkv = new File(workDir, safeName.replaceAll("\\.mp4$", ".mkv"));
        String[] fallback = new String[] {
                "-y",
                "-i", video.getAbsolutePath(),
                "-i", audio.getAbsolutePath(),
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-c", "copy",
                mkv.getAbsolutePath()
        };

        FFmpegSession fallbackSession = FFmpegKit.executeWithArguments(fallback);

        if (!ReturnCode.isSuccess(fallbackSession.getReturnCode()) ||
                !mkv.exists() ||
                mkv.length() == 0) {
            throw new IllegalStateException("FFmpeg не смог склеить видео и звук");
        }

        return mkv;
    }

    private Uri saveToDownloads(File source) throws Exception {
        return saveToDownloads(source, true);
    }

    private Uri saveToDownloads(File source, boolean updateUi) throws Exception {
        String name = source.getName();
        String lower = name.toLowerCase(Locale.ROOT);
        String mime;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            mime = "image/jpeg";
        } else if (lower.endsWith(".png")) {
            mime = "image/png";
        } else if (lower.endsWith(".webp")) {
            mime = "image/webp";
        } else if (lower.endsWith(".gif")) {
            mime = "image/gif";
        } else if (lower.endsWith(".avif")) {
            mime = "image/avif";
        } else if (lower.endsWith(".heic") || lower.endsWith(".heif")) {
            mime = "image/heif";
        } else if (lower.endsWith(".mp3")) {
            mime = "audio/mpeg";
        } else if (lower.endsWith(".mp4")) {
            mime = "video/mp4";
        } else if (lower.endsWith(".webm")) {
            mime = "video/webm";
        } else if (lower.endsWith(".m4v")) {
            mime = "video/x-m4v";
        } else if (lower.endsWith(".mkv")) {
            mime = "video/x-matroska";
        } else {
            mime = "application/octet-stream";
        }

        ContentResolver resolver = getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, name);
        values.put(MediaStore.Downloads.MIME_TYPE, mime);
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new IllegalStateException("Android не создал файл в Downloads");
        }

        try {
            long total = Math.max(1, source.length());
            long copied = 0;
            long lastUi = 0;

            try (InputStream in = new FileInputStream(source);
                 OutputStream out = resolver.openOutputStream(uri)) {
                if (out == null) {
                    throw new IllegalStateException("Android не открыл файл для записи");
                }

                byte[] buffer = new byte[1024 * 128];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    copied += read;

                    long now = System.currentTimeMillis();
                    if (updateUi && now - lastUi > 220) {
                        lastUi = now;
                        int savePercent = 97 + (int) Math.min(2, (copied * 2) / total);
                        int finalSavePercent = savePercent;
                        runOnUiThread(() -> {
                            progressBar.setIndeterminate(false);
                            progressBar.setProgress(finalSavePercent);
                            percentText.setText(finalSavePercent + "%");
                            status.setText("Сохраняю в Downloads…");
                        });
                    }
                }
                out.flush();
            }

            ContentValues done = new ContentValues();
            done.put(MediaStore.Downloads.IS_PENDING, 0);
            resolver.update(uri, done, null, null);
            return uri;

        } catch (Throwable e) {
            resolver.delete(uri, null, null);
            throw e;
        }
    }
}
