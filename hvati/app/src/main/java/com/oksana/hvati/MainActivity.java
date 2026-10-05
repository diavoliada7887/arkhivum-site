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
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.chaquo.python.PyObject;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {

    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");

    private EditText urlBox;
    private TextView status;

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
        scroll.setBackgroundColor(Color.rgb(247, 247, 250));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(22), dp(28), dp(22), dp(28));
        scroll.addView(root, new ScrollView.LayoutParams(
                ScrollView.LayoutParams.MATCH_PARENT,
                ScrollView.LayoutParams.WRAP_CONTENT));

        TextView title = new TextView(this);
        title.setText("Хвать");
        title.setTextSize(34);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setTextColor(Color.rgb(17, 19, 24));
        root.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("Автономная версия. Termux больше не нужен.");
        subtitle.setTextSize(16);
        subtitle.setTextColor(Color.rgb(78, 82, 92));
        LinearLayout.LayoutParams subLp = lp();
        subLp.topMargin = dp(8);
        root.addView(subtitle, subLp);

        urlBox = new EditText(this);
        urlBox.setHint("Вставь ссылку или поделись ею сюда");
        urlBox.setTextSize(15);
        urlBox.setSingleLine(false);
        urlBox.setMinLines(2);
        urlBox.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        urlBox.setPadding(dp(14), dp(12), dp(14), dp(12));
        LinearLayout.LayoutParams urlLp = lp();
        urlLp.topMargin = dp(22);
        root.addView(urlBox, urlLp);

        TextView choose = new TextView(this);
        choose.setText("Качество");
        choose.setTextSize(18);
        choose.setTypeface(Typeface.DEFAULT_BOLD);
        choose.setTextColor(Color.rgb(17, 19, 24));
        LinearLayout.LayoutParams chooseLp = lp();
        chooseLp.topMargin = dp(24);
        root.addView(choose, chooseLp);

        root.addView(makeButton("480p · компактно", "480"));
        root.addView(makeButton("720p · покрасивее", "720"));
        root.addView(makeButton("Лучшее единым файлом", "best"));

        TextView note = new TextView(this);
        note.setText("v0.4 пока скачивает только готовые видеофайлы. MP3 и склейку раздельных потоков добавим следующим слоем.");
        note.setTextSize(13);
        note.setTextColor(Color.rgb(90, 94, 104));
        LinearLayout.LayoutParams noteLp = lp();
        noteLp.topMargin = dp(18);
        root.addView(note, noteLp);

        status = new TextView(this);
        status.setText("Готов. Файлы сохраняются в Downloads.");
        status.setTextSize(14);
        status.setTextColor(Color.rgb(78, 82, 92));
        status.setGravity(Gravity.CENTER_HORIZONTAL);
        LinearLayout.LayoutParams stLp = lp();
        stLp.topMargin = dp(22);
        root.addView(status, stLp);

        setContentView(scroll);
    }

    private Button makeButton(String label, String mode) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setText(label);
        b.setTextSize(16);
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
        String url = extractUrl(urlBox.getText().toString());
        if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) {
            Toast.makeText(this, "Дай мне нормальную ссылку 🙂", Toast.LENGTH_SHORT).show();
            return;
        }

        status.setText("Тащу видео…");

        new Thread(() -> {
            try {
                File workDir = new File(getCacheDir(), "yt_downloads");
                if (!workDir.exists() && !workDir.mkdirs()) {
                    throw new IllegalStateException("Не удалось создать временную папку");
                }

                Python py = Python.getInstance();
                PyObject module = py.getModule("downloader");
                PyObject result = module.callAttr(
                        "download",
                        url,
                        mode,
                        workDir.getAbsolutePath()
                );

                String path = result.toJava(String.class);
                File file = new File(path);
                Uri saved = saveToDownloads(file);

                runOnUiThread(() -> {
                    status.setText("Готово 😏  " + file.getName());
                    Toast.makeText(this, "Сохранено в Downloads", Toast.LENGTH_LONG).show();
                });

            } catch (Throwable e) {
                String message = e.getMessage();
                if (message == null || message.trim().isEmpty()) {
                    message = e.getClass().getSimpleName();
                }
                String finalMessage = message;
                runOnUiThread(() -> {
                    status.setText("Не вышло: " + finalMessage);
                    Toast.makeText(this, "Скачивание не удалось", Toast.LENGTH_LONG).show();
                });
            }
        }).start();
    }

    private Uri saveToDownloads(File source) throws Exception {
        String name = source.getName();
        String lower = name.toLowerCase(Locale.ROOT);
        String mime;
        if (lower.endsWith(".mp4")) {
            mime = "video/mp4";
        } else if (lower.endsWith(".webm")) {
            mime = "video/webm";
        } else if (lower.endsWith(".m4v")) {
            mime = "video/x-m4v";
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
            try (InputStream in = new FileInputStream(source);
                 OutputStream out = resolver.openOutputStream(uri)) {
                if (out == null) {
                    throw new IllegalStateException("Android не открыл файл для записи");
                }

                byte[] buffer = new byte[1024 * 128];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
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
