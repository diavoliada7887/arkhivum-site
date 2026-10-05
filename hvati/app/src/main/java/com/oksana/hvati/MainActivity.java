package com.oksana.hvati;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {

    private static final String TERMUX_PERMISSION = "com.termux.permission.RUN_COMMAND";
    private static final int REQ_TERMUX_PERMISSION = 42;
    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");

    private EditText urlBox;
    private TextView status;
    private String pendingMode = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
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
        subtitle.setText("Поделись ссылкой сюда — и забери видео без рекламной помойки.");
        subtitle.setTextSize(16);
        subtitle.setTextColor(Color.rgb(78, 82, 92));
        LinearLayout.LayoutParams subLp = lp();
        subLp.topMargin = dp(8);
        root.addView(subtitle, subLp);

        urlBox = new EditText(this);
        urlBox.setHint("https://...");
        urlBox.setTextSize(15);
        urlBox.setSingleLine(false);
        urlBox.setMinLines(2);
        urlBox.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        urlBox.setPadding(dp(14), dp(12), dp(14), dp(12));
        LinearLayout.LayoutParams urlLp = lp();
        urlLp.topMargin = dp(22);
        root.addView(urlBox, urlLp);

        TextView choose = new TextView(this);
        choose.setText("Что тащим?");
        choose.setTextSize(18);
        choose.setTypeface(Typeface.DEFAULT_BOLD);
        choose.setTextColor(Color.rgb(17, 19, 24));
        LinearLayout.LayoutParams chooseLp = lp();
        chooseLp.topMargin = dp(24);
        root.addView(choose, chooseLp);

        root.addView(makeButton("480p · компактно", "480"));
        root.addView(makeButton("720p · покрасивее", "720"));
        root.addView(makeButton("Лучшее качество", "best"));
        root.addView(makeButton("Только MP3", "mp3"));

        status = new TextView(this);
        status.setText("Файлы будут падать в Downloads.");
        status.setTextSize(14);
        status.setTextColor(Color.rgb(78, 82, 92));
        status.setGravity(Gravity.CENTER_HORIZONTAL);
        LinearLayout.LayoutParams stLp = lp();
        stLp.topMargin = dp(18);
        root.addView(status, stLp);

        TextView setupTitle = new TextView(this);
        setupTitle.setText("Первый запуск");
        setupTitle.setTextSize(17);
        setupTitle.setTypeface(Typeface.DEFAULT_BOLD);
        setupTitle.setTextColor(Color.rgb(17, 19, 24));
        LinearLayout.LayoutParams setTitleLp = lp();
        setTitleLp.topMargin = dp(30);
        root.addView(setupTitle, setTitleLp);

        TextView setup = new TextView(this);
        setup.setText("Termux должен разрешить внешние команды. Нажми кнопку ниже, вставь команду в Termux один раз и вернись сюда.");
        setup.setTextSize(14);
        setup.setTextColor(Color.rgb(78, 82, 92));
        LinearLayout.LayoutParams setupLp = lp();
        setupLp.topMargin = dp(6);
        root.addView(setup, setupLp);

        Button copy = new Button(this);
        copy.setAllCaps(false);
        copy.setText("Скопировать команду настройки");
        copy.setOnClickListener(v -> copySetupCommand());
        LinearLayout.LayoutParams copyLp = lp();
        copyLp.topMargin = dp(10);
        root.addView(copy, copyLp);

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

        if (!isTermuxInstalled()) {
            Toast.makeText(this, "Не вижу Termux на телефоне.", Toast.LENGTH_LONG).show();
            return;
        }

        if (checkSelfPermission(TERMUX_PERMISSION) != PackageManager.PERMISSION_GRANTED) {
            pendingMode = mode;
            requestPermissions(new String[]{TERMUX_PERMISSION}, REQ_TERMUX_PERMISSION);
            status.setText("Разреши приложению запускать команды в Termux.");
            return;
        }

        runYtDlp(mode, url);
    }

    private boolean isTermuxInstalled() {
        try {
            getPackageManager().getPackageInfo("com.termux", 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private void runYtDlp(String mode, String url) {
        String format;
        String[] args;

        if ("mp3".equals(mode)) {
            args = new String[]{
                    "--no-playlist",
                    "-P", "/data/data/com.termux/files/home/storage/downloads",
                    "-x", "--audio-format", "mp3", "--audio-quality", "0",
                    url
            };
        } else {
            if ("480".equals(mode)) {
                format = "bv*[height<=480]+ba/b[height<=480]/b";
            } else if ("720".equals(mode)) {
                format = "bv*[height<=720]+ba/b[height<=720]/b";
            } else {
                format = "bv*+ba/b";
            }

            args = new String[]{
                    "--no-playlist",
                    "-P", "/data/data/com.termux/files/home/storage/downloads",
                    "-f", format,
                    "--merge-output-format", "mp4",
                    url
            };
        }

        Intent i = new Intent();
        i.setComponent(new ComponentName("com.termux", "com.termux.app.RunCommandService"));
        i.setAction("com.termux.RUN_COMMAND");
        i.putExtra("com.termux.RUN_COMMAND_PATH", "/data/data/com.termux/files/usr/bin/yt-dlp");
        i.putExtra("com.termux.RUN_COMMAND_ARGUMENTS", args);
        i.putExtra("com.termux.RUN_COMMAND_WORKDIR", "/data/data/com.termux/files/home");
        i.putExtra("com.termux.RUN_COMMAND_BACKGROUND", true);
        i.putExtra("com.termux.RUN_COMMAND_LABEL", "Хвать");

        try {
            startService(i);
            status.setText("Потащил. Смотри Downloads 😏");
            Toast.makeText(this, "Скачивание отправлено в Termux", Toast.LENGTH_SHORT).show();
        } catch (SecurityException e) {
            status.setText("Android не дал доступ к Termux. Разреши «Запуск команд в Termux» в разрешениях приложения.");
            openAppSettings();
        } catch (Exception e) {
            status.setText("Не вышло: " + e.getMessage());
            Toast.makeText(this, "Termux ругнулся. Проверь настройку внешних команд.", Toast.LENGTH_LONG).show();
        }
    }

    private void copySetupCommand() {
        String cmd = "mkdir -p ~/.termux && (grep -q '^allow-external-apps *= *true' ~/.termux/termux.properties 2>/dev/null || echo 'allow-external-apps = true' >> ~/.termux/termux.properties) && termux-reload-settings";
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        clipboard.setPrimaryClip(ClipData.newPlainText("Настройка Termux для Хвать", cmd));
        Toast.makeText(this, "Скопировано. Вставь это в Termux.", Toast.LENGTH_SHORT).show();

        Intent launch = getPackageManager().getLaunchIntentForPackage("com.termux");
        if (launch != null) startActivity(launch);
    }

    private void openAppSettings() {
        Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        i.setData(Uri.parse("package:" + getPackageName()));
        startActivity(i);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_TERMUX_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                String mode = pendingMode;
                pendingMode = null;
                if (mode != null) startDownload(mode);
            } else {
                status.setText("Без разрешения Termux я команды запускать не смогу.");
            }
        }
    }
}
