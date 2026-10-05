package com.oksana.hvati;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.text.Editable;
import android.text.InputType;
import android.text.TextWatcher;
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

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {

    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");
    private static final int BG = Color.rgb(14, 16, 20);
    private static final int PANEL = Color.rgb(28, 32, 39);
    private static final int BUTTON = Color.rgb(34, 39, 47);
    private static final int TEXT = Color.rgb(242, 245, 248);
    private static final int MUTED = Color.rgb(125, 135, 148);

    private EditText urlBox;
    private TextView recommendation;
    private TextView status;
    private TextView percentText;
    private TextView progressDetails;
    private TextView queueTitle;
    private ProgressBar progressBar;
    private LinearLayout queueContainer;
    private LinearLayout historyContainer;
    private LinearLayout afterDownloadActions;
    private Button retryButton;
    private Button mode240;
    private Button mode480;
    private Button mode720;
    private Button mode1080;
    private Button modeMp3;

    private final Handler probeHandler = new Handler(Looper.getMainLooper());
    // One worker across Activity recreation, and at most one pending URL.
    private static final ThreadPoolExecutor PROBE_EXECUTOR = new ThreadPoolExecutor(
            1, 1, 0L, TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(1),
            runnable -> new Thread(runnable, "hvati-size-probe"),
            new ThreadPoolExecutor.DiscardOldestPolicy());
    private Future<?> probeFuture;
    private volatile int probeGeneration = 0;
    private volatile boolean probeDestroyed = false;
    private String probeUrl;
    private Runnable pendingProbe;

    private ArrayList<Uri> lastUris = new ArrayList<>();
    private String lastMime = "*/*";
    private String failedUrl;
    private String failedMode;

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent == null || intent.getAction() == null) return;
            switch (intent.getAction()) {
                case DownloadService.EVENT_PROGRESS:
                    applyProgress(
                            intent.getIntExtra(DownloadService.EXTRA_PERCENT, -1),
                            intent.getStringExtra(DownloadService.EXTRA_STAGE),
                            intent.getStringExtra(DownloadService.EXTRA_DETAILS)
                    );
                    break;
                case DownloadService.EVENT_QUEUE:
                    renderQueue(intent.getStringExtra(DownloadService.EXTRA_QUEUE_JSON));
                    break;
                case DownloadService.EVENT_COMPLETE:
                    handleComplete(intent);
                    break;
                case DownloadService.EVENT_ERROR:
                    handleError(intent);
                    break;
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        buildUi();
        requestNotificationsIfNeeded();
    }

    @Override
    protected void onStart() {
        super.onStart();
        IntentFilter filter = new IntentFilter();
        filter.addAction(DownloadService.EVENT_PROGRESS);
        filter.addAction(DownloadService.EVENT_QUEUE);
        filter.addAction(DownloadService.EVENT_COMPLETE);
        filter.addAction(DownloadService.EVENT_ERROR);
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(receiver, filter);
        }
        refreshHistory();
    }

    @Override
    protected void onStop() {
        super.onStop();
        try { unregisterReceiver(receiver); } catch (Throwable ignored) { }
    }

    @Override
    protected void onDestroy() {
        probeDestroyed = true;
        probeGeneration++;
        cancelPendingProbe();
        super.onDestroy();
    }

    private void cancelPendingProbe() {
        if (pendingProbe != null) probeHandler.removeCallbacks(pendingProbe);
        pendingProbe = null;
        if (probeFuture != null) {
            // Interrupting Java does not reliably interrupt Python network IO.
            // The running request finishes, but cannot publish stale results.
            probeFuture.cancel(false);
            if (probeFuture instanceof Runnable) PROBE_EXECUTOR.remove((Runnable) probeFuture);
            probeFuture = null;
        }
    }

    private void buildUi() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(22), dp(28), dp(22), dp(32));
        scroll.addView(root, new ScrollView.LayoutParams(
                ScrollView.LayoutParams.MATCH_PARENT,
                ScrollView.LayoutParams.WRAP_CONTENT));

        TextView title = text("Хвать", 34, TEXT, true);
        root.addView(title);

        TextView version = text("v" + BuildConfig.VERSION_NAME, 13, MUTED, false);
        LinearLayout.LayoutParams versionLp = lp();
        versionLp.topMargin = dp(2);
        root.addView(version, versionLp);

        urlBox = new EditText(this);
        urlBox.setHint("Вставь ссылку");
        urlBox.setTextSize(16);
        urlBox.setSingleLine(false);
        urlBox.setMinLines(2);
        urlBox.setMaxLines(4);
        urlBox.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        urlBox.setTextColor(TEXT);
        urlBox.setHintTextColor(MUTED);
        urlBox.setBackgroundColor(PANEL);
        urlBox.setPadding(dp(14), dp(12), dp(14), dp(12));
        LinearLayout.LayoutParams urlLp = lp();
        urlLp.topMargin = dp(20);
        root.addView(urlBox, urlLp);

        recommendation = text("Видео · обычно удобно 720P", 13, MUTED, false);
        LinearLayout.LayoutParams recLp = lp();
        recLp.topMargin = dp(8);
        root.addView(recommendation, recLp);

        urlBox.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) { }
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                updateRecommendation(s.toString());
                scheduleProbe(s.toString());
            }
            @Override public void afterTextChanged(Editable s) { }
        });

        TextView formatTitle = text("Формат", 18, TEXT, true);
        LinearLayout.LayoutParams formatLp = lp();
        formatLp.topMargin = dp(22);
        root.addView(formatTitle, formatLp);

        mode240 = makeModeButton("240P · эконом", "240");
        mode480 = makeModeButton("480P", "480");
        mode720 = makeModeButton("720P", "720");
        mode1080 = makeModeButton("1080P", "1080");
        modeMp3 = makeModeButton("MP3 из видео", "mp3");

        root.addView(mode240);
        root.addView(mode480);
        root.addView(mode720);
        root.addView(mode1080);
        root.addView(modeMp3);
        root.addView(makeModeButton("Фото / карусель", "images"));

        LinearLayout utilities = new LinearLayout(this);
        utilities.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams utilitiesLp = lp();
        utilitiesLp.topMargin = dp(16);
        root.addView(utilities, utilitiesLp);

        Button folder = utilityButton("Загрузки");
        folder.setOnClickListener(v -> openDownloadsFolder());
        LinearLayout.LayoutParams folderLp = new LinearLayout.LayoutParams(0, dp(52), 1f);
        folderLp.rightMargin = dp(4);
        utilities.addView(folder, folderLp);

        Button abilities = utilityButton("Что я умею");
        abilities.setOnClickListener(v -> showCapabilities());
        LinearLayout.LayoutParams abilitiesLp = new LinearLayout.LayoutParams(0, dp(52), 1f);
        abilitiesLp.leftMargin = dp(4);
        abilitiesLp.rightMargin = dp(4);
        utilities.addView(abilities, abilitiesLp);

        Button feedback = utilityButton("Связь");
        feedback.setOnClickListener(v -> openUrl("https://t.me/hvat_download_bot"));
        LinearLayout.LayoutParams feedbackLp = new LinearLayout.LayoutParams(0, dp(52), 1f);
        feedbackLp.leftMargin = dp(4);
        utilities.addView(feedback, feedbackLp);

        LinearLayout progressRow = new LinearLayout(this);
        progressRow.setOrientation(LinearLayout.HORIZONTAL);
        progressRow.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams progressLp = lp();
        progressLp.topMargin = dp(24);
        root.addView(progressRow, progressLp);

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgress(0);
        LinearLayout.LayoutParams barLp = new LinearLayout.LayoutParams(0, dp(12), 1f);
        progressRow.addView(progressBar, barLp);

        percentText = text("0%", 18, TEXT, true);
        percentText.setGravity(Gravity.END);
        LinearLayout.LayoutParams pctLp = new LinearLayout.LayoutParams(dp(72), LinearLayout.LayoutParams.WRAP_CONTENT);
        pctLp.leftMargin = dp(12);
        progressRow.addView(percentText, pctLp);

        status = text("Готов", 15, MUTED, false);
        LinearLayout.LayoutParams stLp = lp();
        stLp.topMargin = dp(10);
        root.addView(status, stLp);

        progressDetails = text("", 13, MUTED, false);
        LinearLayout.LayoutParams detLp = lp();
        detLp.topMargin = dp(4);
        root.addView(progressDetails, detLp);

        afterDownloadActions = new LinearLayout(this);
        afterDownloadActions.setOrientation(LinearLayout.HORIZONTAL);
        afterDownloadActions.setVisibility(View.GONE);
        LinearLayout.LayoutParams actionsLp = lp();
        actionsLp.topMargin = dp(12);
        root.addView(afterDownloadActions, actionsLp);

        Button open = utilityButton("Открыть");
        open.setOnClickListener(v -> openLast());
        afterDownloadActions.addView(open, thirdLp(false, false));

        Button share = utilityButton("Поделиться");
        share.setOnClickListener(v -> shareLast());
        afterDownloadActions.addView(share, thirdLp(true, false));

        Button folderAfter = utilityButton("Папка");
        folderAfter.setOnClickListener(v -> openDownloadsFolder());
        afterDownloadActions.addView(folderAfter, thirdLp(true, true));

        retryButton = utilityButton("Повторить");
        retryButton.setVisibility(View.GONE);
        retryButton.setOnClickListener(v -> {
            if (failedUrl != null && failedMode != null) {
                DownloadService.enqueue(this, failedUrl, failedMode);
                retryButton.setVisibility(View.GONE);
                status.setText("Повторяю…");
            }
        });
        LinearLayout.LayoutParams retryLp = lp();
        retryLp.topMargin = dp(10);
        root.addView(retryButton, retryLp);

        queueTitle = text("Очередь", 18, TEXT, true);
        queueTitle.setVisibility(View.GONE);
        LinearLayout.LayoutParams queueTitleLp = lp();
        queueTitleLp.topMargin = dp(24);
        root.addView(queueTitle, queueTitleLp);

        queueContainer = new LinearLayout(this);
        queueContainer.setOrientation(LinearLayout.VERTICAL);
        root.addView(queueContainer, lp());

        TextView historyTitle = text("Недавние", 18, TEXT, true);
        LinearLayout.LayoutParams historyTitleLp = lp();
        historyTitleLp.topMargin = dp(24);
        root.addView(historyTitle, historyTitleLp);

        historyContainer = new LinearLayout(this);
        historyContainer.setOrientation(LinearLayout.VERTICAL);
        root.addView(historyContainer, lp());

        setContentView(scroll);
    }

    private Button makeModeButton(String label, String mode) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setText(label);
        b.setTextSize(16);
        b.setTextColor(TEXT);
        b.setBackgroundColor(BUTTON);
        b.setOnClickListener(v -> enqueue(mode));
        LinearLayout.LayoutParams p = lp();
        p.topMargin = dp(9);
        b.setLayoutParams(p);
        return b;
    }

    private Button utilityButton(String label) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setText(label);
        b.setTextSize(14);
        b.setTextColor(Color.rgb(190, 199, 211));
        b.setBackgroundColor(Color.rgb(25, 29, 35));
        return b;
    }

    private void enqueue(String mode) {
        String url = extractUrl(urlBox.getText().toString());
        if (url == null) {
            Toast.makeText(this, "Нужна ссылка", Toast.LENGTH_SHORT).show();
            return;
        }
        getSharedPreferences("hvati_prefs", MODE_PRIVATE).edit().putString("last_mode", mode).apply();
        DownloadService.enqueue(this, url, mode);
        status.setText("Добавлено в очередь");
        progressDetails.setText(labelFor(mode));
        retryButton.setVisibility(View.GONE);
    }

    private void applyProgress(int percent, String stage, String details) {
        status.setText(stage == null ? "Загрузка" : stage);
        progressDetails.setText(details == null ? "" : details);
        if (percent >= 0) {
            progressBar.setIndeterminate(false);
            progressBar.setProgress(percent);
            percentText.setText(percent + "%");
        } else {
            progressBar.setIndeterminate(true);
            percentText.setText("…");
        }
    }

    private void handleComplete(Intent intent) {
        progressBar.setIndeterminate(false);
        progressBar.setProgress(100);
        percentText.setText("100%");
        status.setText("Готово");
        progressDetails.setText(intent.getStringExtra(DownloadService.EXTRA_NAME));
        lastMime = intent.getStringExtra(DownloadService.EXTRA_MIME);
        lastUris = parseUris(intent.getStringExtra(DownloadService.EXTRA_URIS_JSON));
        afterDownloadActions.setVisibility(lastUris.isEmpty() ? View.GONE : View.VISIBLE);
        retryButton.setVisibility(View.GONE);
        refreshHistory();
    }

    private void handleError(Intent intent) {
        String message = intent.getStringExtra(DownloadService.EXTRA_MESSAGE);
        failedUrl = intent.getStringExtra(DownloadService.EXTRA_URL);
        failedMode = intent.getStringExtra(DownloadService.EXTRA_MODE);
        progressBar.setIndeterminate(false);
        percentText.setText("—");
        status.setText("Ошибка");
        progressDetails.setText(message);
        retryButton.setVisibility("Отменено".equals(message) ? View.GONE : View.VISIBLE);
    }

    private void renderQueue(String json) {
        queueContainer.removeAllViews();
        if (json == null) {
            queueTitle.setVisibility(View.GONE);
            return;
        }
        try {
            JSONArray arr = new JSONArray(json);
            queueTitle.setVisibility(arr.length() == 0 ? View.GONE : View.VISIBLE);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject item = arr.getJSONObject(i);
                String id = item.getString("id");
                String mode = item.getString("mode");
                String state = item.getString("state");
                String url = item.optString("url", "");

                LinearLayout row = new LinearLayout(this);
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setGravity(Gravity.CENTER_VERTICAL);
                row.setPadding(0, dp(4), 0, dp(4));

                TextView label = text(
                        ("current".equals(state) ? "Качаю · " : "Ждёт · ")
                                + labelFor(mode) + " · " + host(url),
                        13,
                        MUTED,
                        false
                );
                row.addView(label, new LinearLayout.LayoutParams(
                        0,
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        1f
                ));

                Button cancel = utilityButton("×");
                cancel.setOnClickListener(v -> DownloadService.cancel(this, id));
                row.addView(cancel, new LinearLayout.LayoutParams(dp(52), dp(44)));
                queueContainer.addView(row, lp());
            }
        } catch (Throwable e) {
            queueTitle.setVisibility(View.GONE);
        }
    }

    private void refreshHistory() {
        historyContainer.removeAllViews();
        try {
            SharedPreferences prefs = getSharedPreferences("hvati_prefs", MODE_PRIVATE);
            JSONArray history = new JSONArray(prefs.getString("history_json", "[]"));
            if (history.length() == 0) {
                TextView empty = text("Пока пусто", 13, MUTED, false);
                LinearLayout.LayoutParams p = lp();
                p.topMargin = dp(8);
                historyContainer.addView(empty, p);
                return;
            }

            SimpleDateFormat time = new SimpleDateFormat("HH:mm", Locale.getDefault());
            for (int i = 0; i < Math.min(8, history.length()); i++) {
                JSONObject item = history.getJSONObject(i);
                ArrayList<Uri> uris = parseUris(item.getJSONArray("uris").toString());
                String mime = item.optString("mime", "*/*");
                String name = item.optString("name", "Файл");
                String mode = labelFor(item.optString("mode", ""));
                long timestamp = item.optLong("time", 0);

                LinearLayout row = new LinearLayout(this);
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setGravity(Gravity.CENTER_VERTICAL);
                row.setPadding(0, dp(5), 0, dp(5));

                Button open = utilityButton(
                        shorten(name, 34) + "\n" + mode + " · " + time.format(new Date(timestamp))
                );
                open.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
                open.setOnClickListener(v -> openUris(uris, mime));
                row.addView(open, new LinearLayout.LayoutParams(0, dp(62), 1f));

                Button share = utilityButton("↗");
                share.setOnClickListener(v -> shareUris(uris, mime));
                LinearLayout.LayoutParams shareLp = new LinearLayout.LayoutParams(dp(58), dp(62));
                shareLp.leftMargin = dp(6);
                row.addView(share, shareLp);

                historyContainer.addView(row, lp());
            }
        } catch (Throwable e) {
            historyContainer.addView(text("История недоступна", 13, MUTED, false), lp());
        }
    }

    private void updateRecommendation(String raw) {
        String lower = raw.toLowerCase(Locale.ROOT);
        if (lower.contains("instagram.com/p/")
                || lower.matches(".*\\.(jpg|jpeg|png|webp|gif|avif|heic)(\\?.*)?$")) {
            recommendation.setText("Похоже на фото или карусель · жми «Фото / карусель»");
        } else if (lower.contains("instagram.com/reel/")) {
            recommendation.setText("Reels · обычно хватает 720P");
        } else if (lower.contains("vkvideo")
                || lower.contains("vk.com/video")
                || lower.contains("vk.ru/video")) {
            recommendation.setText("VK Video · включён быстрый режим по кускам");
        } else {
            recommendation.setText("Видео · обычно удобно 720P");
        }
    }


    private void showCapabilities() {
        String message =
                "Видео: YouTube, VK Video, RuTube, Instagram Reels, Pinterest и другие поддерживаемые сайты.\n\n"
                + "Фото и Instagram-карусели: сохраняю все слайды.\n\n"
                + "Умею делать MP3 из видео.\n\nКачество видео: 240P / 480P / 720P / 1080P. Размер рядом с качеством — примерный.\n\n"
                + "Есть очередь, фоновые загрузки, повтор после обрыва, история и кнопки «Открыть / Поделиться / Папка».\n\n"
                + "Важно: если сайт у тебя открывается только через VPN, не выключай VPN до конца загрузки. "
                + "Особенно это касается YouTube, Instagram и других ограниченных сервисов.";

        new AlertDialog.Builder(this)
                .setTitle("Что я умею")
                .setMessage(message)
                .setPositiveButton("Понятно", null)
                .show();
    }

    private void scheduleProbe(String raw) {
        final String url = extractUrl(raw);
        if (java.util.Objects.equals(url, probeUrl)) return;
        probeUrl = url;
        resetSizeLabels();
        final int generation = ++probeGeneration;
        cancelPendingProbe();
        if (url == null || probeDestroyed) return;
        pendingProbe = () -> runProbe(url, generation);
        probeHandler.postDelayed(pendingProbe, 650);
    }

    private void runProbe(String url, int generation) {
        if (probeDestroyed || generation != probeGeneration) return;
        final Context appContext = getApplicationContext();
        probeFuture = PROBE_EXECUTOR.submit(() -> {
            if (probeDestroyed || generation != probeGeneration) return;
            try {
                synchronized (Python.class) {
                    if (!Python.isStarted()) Python.start(new AndroidPlatform(appContext));
                }
                if (probeDestroyed || generation != probeGeneration) return;
                PyObject result = Python.getInstance().getModule("probe").callAttr("probe", url);
                JSONObject sizes = new JSONObject(result.toJava(String.class));
                runOnUiThread(() -> {
                    if (probeDestroyed || generation != probeGeneration || isFinishing()) return;
                    if (!url.equals(extractUrl(urlBox.getText().toString()))) return;
                    applySizeLabel(mode240, "240P · эконом", sizes.optLong("240", 0));
                    applySizeLabel(mode480, "480P", sizes.optLong("480", 0));
                    applySizeLabel(mode720, "720P", sizes.optLong("720", 0));
                    applySizeLabel(mode1080, "1080P", sizes.optLong("1080", 0));
                    applySizeLabel(modeMp3, "MP3 из видео", sizes.optLong("mp3", 0));
                });
            } catch (Exception ignored) {
                // Optional metadata: keep the ordinary buttons on any failure.
            }
        });
    }

    private void resetSizeLabels() {
        if (mode240 != null) mode240.setText("240P · эконом");
        if (mode480 != null) mode480.setText("480P");
        if (mode720 != null) mode720.setText("720P");
        if (mode1080 != null) mode1080.setText("1080P");
        if (modeMp3 != null) modeMp3.setText("MP3 из видео");
    }

    private void applySizeLabel(Button button, String base, long bytes) {
        if (button == null) return;
        button.setText(bytes > 0 ? base + "   ·   ~" + formatApproxSize(bytes) : base);
    }

    private String formatApproxSize(long bytes) {
        double mb = bytes / (1024.0 * 1024.0);
        if (mb < 1) return "<1 МБ";
        if (mb < 1000) return String.format(Locale.getDefault(), "%.0f МБ", mb);
        return String.format(Locale.getDefault(), "%.1f ГБ", mb / 1024.0);
    }

    private void openLast() {
        openUris(lastUris, lastMime);
    }

    private void shareLast() {
        shareUris(lastUris, lastMime);
    }

    private void openUris(ArrayList<Uri> uris, String mime) {
        if (uris == null || uris.isEmpty()) return;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uris.get(0), "*/*".equals(mime) ? null : mime);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(intent);
        } catch (Throwable e) {
            Toast.makeText(this, "Не нашёл приложение для открытия", Toast.LENGTH_SHORT).show();
        }
    }

    private void shareUris(ArrayList<Uri> uris, String mime) {
        if (uris == null || uris.isEmpty()) return;
        Intent share;
        if (uris.size() == 1) {
            share = new Intent(Intent.ACTION_SEND);
            share.putExtra(Intent.EXTRA_STREAM, uris.get(0));
        } else {
            share = new Intent(Intent.ACTION_SEND_MULTIPLE);
            share.putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris);
        }
        share.setType(mime == null ? "*/*" : mime);
        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        startActivity(Intent.createChooser(share, "Поделиться"));
    }

    private void openDownloadsFolder() {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, MediaStore.Downloads.EXTERNAL_CONTENT_URI);
            startActivity(intent);
        } catch (Throwable first) {
            try {
                Intent picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                picker.addCategory(Intent.CATEGORY_OPENABLE);
                picker.setType("*/*");
                startActivity(picker);
            } catch (Throwable ignored) {
                Toast.makeText(this, "Открой папку Downloads", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void openUrl(String url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (Throwable e) {
            Toast.makeText(this, url, Toast.LENGTH_LONG).show();
        }
    }

    private ArrayList<Uri> parseUris(String json) {
        ArrayList<Uri> result = new ArrayList<>();
        if (json == null) return result;
        try {
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) result.add(Uri.parse(arr.getString(i)));
        } catch (Throwable ignored) { }
        return result;
    }

    private String extractUrl(String text) {
        if (text == null) return null;
        Matcher m = URL_PATTERN.matcher(text);
        if (!m.find()) return null;
        String url = m.group();
        while (url.endsWith(")") || url.endsWith("]") || url.endsWith("}")
                || url.endsWith(",") || url.endsWith(".") || url.endsWith(";")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    private String labelFor(String mode) {
        switch (mode) {
            case "240": return "240P";
            case "480": return "480P";
            case "720": return "720P";
            case "1080": return "1080P";
            case "mp3": return "MP3 из видео";
            case "images": return "Фото / карусель";
            default: return mode == null ? "" : mode;
        }
    }

    private String host(String url) {
        try {
            String host = Uri.parse(url).getHost();
            return host == null ? "ссылка" : host.replace("www.", "");
        } catch (Throwable e) {
            return "ссылка";
        }
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextSize(size);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private LinearLayout.LayoutParams lp() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
    }

    private LinearLayout.LayoutParams halfLp(boolean right) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(52), 1f);
        if (right) p.leftMargin = dp(5);
        else p.rightMargin = dp(5);
        return p;
    }

    private LinearLayout.LayoutParams thirdLp(boolean leftGap, boolean noRightGap) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(48), 1f);
        if (leftGap) p.leftMargin = dp(4);
        if (!noRightGap) p.rightMargin = dp(4);
        return p;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private String shorten(String value, int max) {
        if (value == null) return "Файл";
        return value.length() <= max ? value : value.substring(0, max - 1) + "…";
    }

    private void requestNotificationsIfNeeded() {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
        }
    }
}
