package com.oksana.hvati;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.IBinder;
import android.os.StatFs;
import android.provider.MediaStore;

import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.FFmpegSession;
import com.arthenica.ffmpegkit.ReturnCode;
import com.chaquo.python.PyObject;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

public class DownloadService extends Service {

    public static final String ACTION_ENQUEUE = "com.oksana.hvati.ENQUEUE";
    public static final String ACTION_CANCEL = "com.oksana.hvati.CANCEL";
    public static final String ACTION_RETRY = "com.oksana.hvati.RETRY";

    public static final String EVENT_PROGRESS = "com.oksana.hvati.EVENT_PROGRESS";
    public static final String EVENT_QUEUE = "com.oksana.hvati.EVENT_QUEUE";
    public static final String EVENT_COMPLETE = "com.oksana.hvati.EVENT_COMPLETE";
    public static final String EVENT_ERROR = "com.oksana.hvati.EVENT_ERROR";

    public static final String EXTRA_URL = "url";
    public static final String EXTRA_MODE = "mode";
    public static final String EXTRA_TASK_ID = "task_id";
    public static final String EXTRA_PERCENT = "percent";
    public static final String EXTRA_STAGE = "stage";
    public static final String EXTRA_DETAILS = "details";
    public static final String EXTRA_QUEUE_JSON = "queue_json";
    public static final String EXTRA_URIS_JSON = "uris_json";
    public static final String EXTRA_MIME = "mime";
    public static final String EXTRA_NAME = "name";
    public static final String EXTRA_MESSAGE = "message";

    private static final String CHANNEL_ID = "hvati_downloads";
    private static final int FOREGROUND_ID = 4100;
    private static final String PREFS = "hvati_prefs";
    private static final String PREF_HISTORY = "history_json";
    private static final long STALE_MS = 24L * 60L * 60L * 1000L;

    private final ArrayDeque<Task> queue = new ArrayDeque<>();
    private final Object queueLock = new Object();
    private volatile Task currentTask;
    private volatile Thread worker;

    private static class Task {
        final String id;
        final String url;
        final String mode;
        volatile File cancelFile;

        Task(String id, String url, String mode) {
            this.id = id;
            this.url = url;
            this.mode = mode;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        cleanupOldSessions(new File(getCacheDir(), "yt_downloads"));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;
        String action = intent.getAction();

        if (ACTION_CANCEL.equals(action)) {
            cancelTask(intent.getStringExtra(EXTRA_TASK_ID));
            return START_NOT_STICKY;
        }

        if (ACTION_ENQUEUE.equals(action) || ACTION_RETRY.equals(action)) {
            String url = intent.getStringExtra(EXTRA_URL);
            String mode = intent.getStringExtra(EXTRA_MODE);
            if (url == null || mode == null) return START_NOT_STICKY;

            String id = intent.getStringExtra(EXTRA_TASK_ID);
            if (id == null || id.isEmpty()) id = UUID.randomUUID().toString();
            Task task = new Task(id, url, mode);

            synchronized (queueLock) {
                queue.offer(task);
                ensureForeground("Подготовка загрузки…", queue.size() + (currentTask == null ? 0 : 1), -1);
                if (worker == null || !worker.isAlive()) {
                    worker = new Thread(this::processQueue, "hvati-download-worker");
                    worker.start();
                }
            }
            broadcastQueue();
        }

        return START_NOT_STICKY;
    }

    public static void enqueue(Context context, String url, String mode) {
        Intent intent = new Intent(context, DownloadService.class);
        intent.setAction(ACTION_ENQUEUE);
        intent.putExtra(EXTRA_URL, url);
        intent.putExtra(EXTRA_MODE, mode);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        } catch (Throwable e) {
            Intent error = new Intent(EVENT_ERROR);
            error.setPackage(context.getPackageName());
            error.putExtra(EXTRA_URL, url);
            error.putExtra(EXTRA_MODE, mode);
            error.putExtra(EXTRA_MESSAGE, "Android не дал запустить фоновую загрузку: " + e.getClass().getSimpleName());
            context.sendBroadcast(error);
        }
    }

    public static void cancel(Context context, String taskId) {
        Intent intent = new Intent(context, DownloadService.class);
        intent.setAction(ACTION_CANCEL);
        intent.putExtra(EXTRA_TASK_ID, taskId);
        context.startService(intent);
    }

    private void cancelTask(String id) {
        if (id == null) return;

        Task current = currentTask;
        if (current != null && id.equals(current.id)) {
            File marker = current.cancelFile;
            if (marker != null) {
                try {
                    File parent = marker.getParentFile();
                    if (parent != null) parent.mkdirs();
                    marker.createNewFile();
                } catch (Exception ignored) {
                }
            }
            return;
        }

        synchronized (queueLock) {
            Iterator<Task> iterator = queue.iterator();
            while (iterator.hasNext()) {
                if (id.equals(iterator.next().id)) {
                    iterator.remove();
                    break;
                }
            }
        }
        broadcastQueue();
    }

    private void processQueue() {
        while (true) {
            Task task;
            synchronized (queueLock) {
                task = queue.poll();
                currentTask = task;
            }

            if (task == null) {
                currentTask = null;
                broadcastQueue();
                stopForeground(STOP_FOREGROUND_REMOVE);
                stopSelf();
                return;
            }

            broadcastQueue();
            processTask(task);
            currentTask = null;
            broadcastQueue();
        }
    }

    private void processTask(Task task) {
        File root = new File(getCacheDir(), "yt_downloads");
        root.mkdirs();

        File progressFile = new File(getCacheDir(), "progress_" + task.id + ".txt");
        File cancelFile = new File(getCacheDir(), "cancel_" + task.id);
        task.cancelFile = cancelFile;

        if (cancelFile.exists()) cancelFile.delete();
        if (progressFile.exists()) progressFile.delete();

        try {
            ensureEnoughSpace();

            if (!Python.isStarted()) {
                Python.start(new AndroidPlatform(getApplicationContext()));
            }

            AtomicBoolean monitorRunning = new AtomicBoolean(true);
            Thread monitor = new Thread(
                    () -> monitorProgress(task, progressFile, monitorRunning),
                    "hvati-progress"
            );
            monitor.start();

            JSONObject json;
            try {
                Python py = Python.getInstance();
                PyObject result;

                if ("images".equals(task.mode)) {
                    result = py.getModule("image_downloader").callAttr(
                            "download_images",
                            task.url,
                            root.getAbsolutePath(),
                            progressFile.getAbsolutePath(),
                            cancelFile.getAbsolutePath()
                    );
                } else {
                    result = py.getModule("downloader").callAttr(
                            "download",
                            task.url,
                            task.mode,
                            root.getAbsolutePath(),
                            progressFile.getAbsolutePath(),
                            cancelFile.getAbsolutePath()
                    );
                }

                json = new JSONObject(result.toJava(String.class));
            } finally {
                monitorRunning.set(false);
                try {
                    monitor.join(1000);
                } catch (InterruptedException ignored) {
                }
            }

            if (cancelFile.exists()) {
                publishCancelled(task);
                return;
            }

            String kind = json.getString("kind");
            ArrayList<Uri> savedUris = new ArrayList<>();
            ArrayList<String> savedNames = new ArrayList<>();
            String mime = "application/octet-stream";
            File cleanupAnchor = null;

            if ("gallery".equals(kind)) {
                JSONArray files = json.getJSONArray("files");

                for (int i = 0; i < files.length(); i++) {
                    File source = new File(files.getString(i));
                    if (cleanupAnchor == null) cleanupAnchor = source;

                    int percent = 90
                            + (int) Math.floor((i + 1) * 9.0 / Math.max(1, files.length()));
                    publishProgress(
                            task,
                            percent,
                            "Сохраняю карусель…",
                            (i + 1) + " / " + files.length()
                    );

                    Uri uri = saveToDownloads(source);
                    savedUris.add(uri);
                    savedNames.add(source.getName());
                }

                mime = "*/*";

            } else {
                String outputName = json.optString("output_name", "download");
                File output;

                if ("mp3".equals(kind)) {
                    File source = new File(json.getString("source"));
                    cleanupAnchor = source;
                    publishProgress(task, 94, "Конвертирую в MP3…", source.getName());
                    output = convertToMp3(source, source.getParentFile(), outputName);

                } else if ("merge".equals(kind)) {
                    File video = new File(json.getString("video"));
                    File audio = new File(json.getString("audio"));
                    cleanupAnchor = video;
                    publishProgress(task, 95, "Склеиваю видео и звук…", "");
                    output = mergeVideoAudio(
                            video,
                            audio,
                            video.getParentFile(),
                            outputName
                    );

                } else {
                    output = new File(json.getString("source"));
                    cleanupAnchor = output;
                }

                publishProgress(task, 98, "Сохраняю в Downloads…", output.getName());

                Uri uri = saveToDownloads(output);
                savedUris.add(uri);
                savedNames.add(output.getName());
                mime = mimeForName(output.getName());
            }

            String displayName = savedNames.size() == 1
                    ? savedNames.get(0)
                    : "Карусель · " + savedNames.size() + " файлов";

            recordHistory(task, savedUris, displayName, mime);
            publishComplete(task, savedUris, displayName, mime);
            showCompletedNotification(task, savedUris, displayName, mime);

            if (cleanupAnchor != null) {
                cleanupSessionContaining(root, cleanupAnchor);
            }

        } catch (Throwable e) {
            String message = e.getMessage();
            if (message == null || message.trim().isEmpty()) {
                message = e.getClass().getSimpleName();
            }

            if (message.contains("CANCELLED_BY_USER") || cancelFile.exists()) {
                publishCancelled(task);
            } else {
                publishError(task, message);
                showErrorNotification(task, message);
            }

        } finally {
            if (progressFile.exists()) progressFile.delete();
            if (cancelFile.exists()) cancelFile.delete();
        }
    }

    private void monitorProgress(Task task, File progressFile, AtomicBoolean running) {
        String last = "";

        while (running.get()) {
            try {
                if (progressFile.exists()) {
                    String line;
                    try (BufferedReader reader = new BufferedReader(new FileReader(progressFile))) {
                        line = reader.readLine();
                    }

                    if (line != null && !line.equals(last)) {
                        last = line;
                        String[] p = line.split("\\t", -1);

                        if (p.length >= 6) {
                            int percent = Integer.parseInt(p[0]);
                            String stage = p[1];
                            long downloaded = Long.parseLong(p[2]);
                            long total = Long.parseLong(p[3]);
                            long speed = Long.parseLong(p[4]);
                            long eta = Long.parseLong(p[5]);

                            publishProgress(
                                    task,
                                    percent,
                                    stage,
                                    progressDetails(downloaded, total, speed, eta)
                            );
                        }
                    }
                }

                Thread.sleep(180);

            } catch (Throwable ignored) {
                try {
                    Thread.sleep(250);
                } catch (InterruptedException e) {
                    return;
                }
            }
        }
    }

    private void publishProgress(Task task, int percent, String stage, String details) {
        Intent intent = new Intent(EVENT_PROGRESS);
        intent.setPackage(getPackageName());
        intent.putExtra(EXTRA_TASK_ID, task.id);
        intent.putExtra(EXTRA_PERCENT, percent);
        intent.putExtra(EXTRA_STAGE, stage);
        intent.putExtra(EXTRA_DETAILS, details);
        sendBroadcast(intent);

        ensureForeground(stage, queueSizeIncludingCurrent(), percent);
    }

    private void publishComplete(
            Task task,
            ArrayList<Uri> uris,
            String name,
            String mime
    ) {
        Intent intent = new Intent(EVENT_COMPLETE);
        intent.setPackage(getPackageName());
        intent.putExtra(EXTRA_TASK_ID, task.id);
        intent.putExtra(EXTRA_URL, task.url);
        intent.putExtra(EXTRA_MODE, task.mode);
        intent.putExtra(EXTRA_NAME, name);
        intent.putExtra(EXTRA_MIME, mime);
        intent.putExtra(EXTRA_URIS_JSON, urisToJson(uris).toString());
        sendBroadcast(intent);
    }

    private void publishError(Task task, String message) {
        Intent intent = new Intent(EVENT_ERROR);
        intent.setPackage(getPackageName());
        intent.putExtra(EXTRA_TASK_ID, task.id);
        intent.putExtra(EXTRA_URL, task.url);
        intent.putExtra(EXTRA_MODE, task.mode);
        intent.putExtra(EXTRA_MESSAGE, message);
        sendBroadcast(intent);
    }

    private void publishCancelled(Task task) {
        Intent intent = new Intent(EVENT_ERROR);
        intent.setPackage(getPackageName());
        intent.putExtra(EXTRA_TASK_ID, task.id);
        intent.putExtra(EXTRA_URL, task.url);
        intent.putExtra(EXTRA_MODE, task.mode);
        intent.putExtra(EXTRA_MESSAGE, "Отменено");
        sendBroadcast(intent);
    }

    private void broadcastQueue() {
        try {
            JSONArray arr = new JSONArray();

            Task current = currentTask;
            if (current != null) {
                arr.put(taskJson(current, "current"));
            }

            synchronized (queueLock) {
                for (Task task : queue) {
                    arr.put(taskJson(task, "queued"));
                }
            }

            Intent intent = new Intent(EVENT_QUEUE);
            intent.setPackage(getPackageName());
            intent.putExtra(EXTRA_QUEUE_JSON, arr.toString());
            sendBroadcast(intent);

        } catch (Throwable ignored) {
        }
    }

    private JSONObject taskJson(Task task, String state) throws Exception {
        JSONObject object = new JSONObject();
        object.put("id", task.id);
        object.put("url", task.url);
        object.put("mode", task.mode);
        object.put("state", state);
        return object;
    }

    private int queueSizeIncludingCurrent() {
        synchronized (queueLock) {
            return queue.size() + (currentTask == null ? 0 : 1);
        }
    }

    private void ensureForeground(String stage, int count, int percent) {
        Notification.Builder builder = new Notification.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(
                        count > 1
                                ? "Хвать · ещё " + (count - 1) + " в очереди"
                                : "Хвать"
                )
                .setContentText(stage)
                .setOnlyAlertOnce(true)
                .setOngoing(true)
                .setContentIntent(mainPendingIntent());

        if (percent >= 0) {
            builder.setProgress(100, Math.min(100, percent), false);
        } else {
            builder.setProgress(100, 0, true);
        }

        Task current = currentTask;
        if (current != null) {
            Intent cancel = new Intent(this, DownloadService.class);
            cancel.setAction(ACTION_CANCEL);
            cancel.putExtra(EXTRA_TASK_ID, current.id);

            PendingIntent cancelPi = PendingIntent.getService(
                    this,
                    current.id.hashCode(),
                    cancel,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            builder.addAction(
                    new Notification.Action.Builder(null, "Отменить", cancelPi).build()
            );
        }

        startForeground(FOREGROUND_ID, builder.build());
    }

    private void showCompletedNotification(
            Task task,
            ArrayList<Uri> uris,
            String name,
            String mime
    ) {
        Notification.Builder builder = new Notification.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Готово")
                .setContentText(name)
                .setAutoCancel(true)
                .setContentIntent(mainPendingIntent());

        PendingIntent openPi = openPendingIntent(
                uris,
                mime,
                task.id.hashCode() + 11
        );
        PendingIntent sharePi = sharePendingIntent(
                uris,
                mime,
                task.id.hashCode() + 12
        );
        PendingIntent folderPi = folderPendingIntent(
                task.id.hashCode() + 13
        );

        if (openPi != null) {
            builder.addAction(
                    new Notification.Action.Builder(null, "Открыть", openPi).build()
            );
        }
        if (sharePi != null) {
            builder.addAction(
                    new Notification.Action.Builder(null, "Поделиться", sharePi).build()
            );
        }
        if (folderPi != null) {
            builder.addAction(
                    new Notification.Action.Builder(null, "Папка", folderPi).build()
            );
        }

        getSystemService(NotificationManager.class).notify(
                5000 + Math.abs(task.id.hashCode() % 1000),
                builder.build()
        );
    }

    private void showErrorNotification(Task task, String message) {
        Intent retry = new Intent(this, DownloadService.class);
        retry.setAction(ACTION_RETRY);
        retry.putExtra(EXTRA_URL, task.url);
        retry.putExtra(EXTRA_MODE, task.mode);

        PendingIntent retryPi = PendingIntent.getService(
                this,
                task.id.hashCode() + 20,
                retry,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Не удалось скачать")
                .setContentText(shorten(message, 90))
                .setStyle(new Notification.BigTextStyle().bigText(message))
                .setAutoCancel(true)
                .setContentIntent(mainPendingIntent())
                .addAction(
                        new Notification.Action.Builder(null, "Повторить", retryPi).build()
                )
                .build();

        getSystemService(NotificationManager.class).notify(
                6000 + Math.abs(task.id.hashCode() % 1000),
                notification
        );
    }

    private PendingIntent mainPendingIntent() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(
                Intent.FLAG_ACTIVITY_SINGLE_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
        );

        return PendingIntent.getActivity(
                this,
                1,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private PendingIntent openPendingIntent(
            ArrayList<Uri> uris,
            String mime,
            int requestCode
    ) {
        if (uris.isEmpty()) return null;

        Intent open = new Intent(Intent.ACTION_VIEW);
        open.setDataAndType(
                uris.get(0),
                "*/*".equals(mime) ? null : mime
        );
        open.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        return PendingIntent.getActivity(
                this,
                requestCode,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private PendingIntent sharePendingIntent(
            ArrayList<Uri> uris,
            String mime,
            int requestCode
    ) {
        if (uris.isEmpty()) return null;

        Intent share;
        if (uris.size() == 1) {
            share = new Intent(Intent.ACTION_SEND);
            share.putExtra(Intent.EXTRA_STREAM, uris.get(0));
        } else {
            share = new Intent(Intent.ACTION_SEND_MULTIPLE);
            share.putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris);
        }

        share.setType(mime);
        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        Intent chooser = Intent.createChooser(share, "Поделиться");

        return PendingIntent.getActivity(
                this,
                requestCode,
                chooser,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private PendingIntent folderPendingIntent(int requestCode) {
        Intent folder = new Intent(
                Intent.ACTION_VIEW,
                MediaStore.Downloads.EXTERNAL_CONTENT_URI
        );

        return PendingIntent.getActivity(
                this,
                requestCode,
                folder,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void createNotificationChannel() {
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Загрузки Хвать",
                NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Прогресс фоновых загрузок");

        getSystemService(NotificationManager.class)
                .createNotificationChannel(channel);
    }

    private Uri saveToDownloads(File source) throws Exception {
        String name = source.getName();
        String mime = mimeForName(name);

        ContentResolver resolver = getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, name);
        values.put(MediaStore.Downloads.MIME_TYPE, mime);
        values.put(
                MediaStore.Downloads.RELATIVE_PATH,
                Environment.DIRECTORY_DOWNLOADS
        );
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri uri = resolver.insert(
                MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                values
        );

        if (uri == null) {
            throw new IllegalStateException(
                    "Android не создал файл в Downloads"
            );
        }

        try {
            try (
                    InputStream in = new FileInputStream(source);
                    OutputStream out = resolver.openOutputStream(uri)
            ) {
                if (out == null) {
                    throw new IllegalStateException(
                            "Android не открыл файл для записи"
                    );
                }

                byte[] buffer = new byte[1024 * 256];
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

    private File convertToMp3(
            File source,
            File dir,
            String outputName
    ) throws Exception {
        String safeName = outputName.endsWith(".mp3")
                ? outputName
                : outputName + ".mp3";

        File target = new File(dir, safeName);
        if (target.exists()) target.delete();

        String[] args = {
                "-y",
                "-i", source.getAbsolutePath(),
                "-vn",
                "-map_metadata", "0",
                "-codec:a", "libmp3lame",
                "-q:a", "2",
                target.getAbsolutePath()
        };

        FFmpegSession session = FFmpegKit.executeWithArguments(args);

        if (!ReturnCode.isSuccess(session.getReturnCode())
                || !target.exists()
                || target.length() == 0) {
            throw new IllegalStateException(
                    "FFmpeg не смог собрать MP3"
            );
        }

        return target;
    }

    private File mergeVideoAudio(
            File video,
            File audio,
            File dir,
            String outputName
    ) throws Exception {
        String safeName = outputName.endsWith(".mp4")
                ? outputName
                : outputName + ".mp4";

        File target = new File(dir, safeName);
        if (target.exists()) target.delete();

        String[] args = {
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

        FFmpegSession session = FFmpegKit.executeWithArguments(args);

        if (ReturnCode.isSuccess(session.getReturnCode())
                && target.exists()
                && target.length() > 0) {
            return target;
        }

        File mkv = new File(
                dir,
                safeName.replaceAll("\\.mp4$", ".mkv")
        );

        String[] fallback = {
                "-y",
                "-i", video.getAbsolutePath(),
                "-i", audio.getAbsolutePath(),
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-c", "copy",
                mkv.getAbsolutePath()
        };

        FFmpegSession fallbackSession = FFmpegKit.executeWithArguments(
                fallback
        );

        if (!ReturnCode.isSuccess(fallbackSession.getReturnCode())
                || !mkv.exists()
                || mkv.length() == 0) {
            throw new IllegalStateException(
                    "FFmpeg не смог склеить видео и звук"
            );
        }

        return mkv;
    }

    private void ensureEnoughSpace() {
        StatFs stat = new StatFs(getCacheDir().getAbsolutePath());
        long available = stat.getAvailableBytes();
        long floor = 120L * 1024L * 1024L;

        if (available < floor) {
            throw new IllegalStateException(
                    "Мало свободного места: " + formatBytes(available)
            );
        }
    }

    private void cleanupOldSessions(File root) {
        if (!root.exists()) return;
        File[] dirs = root.listFiles();
        if (dirs == null) return;

        long cutoff = System.currentTimeMillis() - STALE_MS;

        for (File file : dirs) {
            if (file.isDirectory() && file.lastModified() < cutoff) {
                deleteRecursively(file);
            }
        }
    }

    private void cleanupSessionContaining(File root, File file) {
        try {
            File cursor = file.isDirectory()
                    ? file
                    : file.getParentFile();

            while (
                    cursor != null
                            && cursor.getParentFile() != null
                            && !cursor.getParentFile().equals(root)
            ) {
                cursor = cursor.getParentFile();
            }

            if (
                    cursor != null
                            && cursor.getParentFile() != null
                            && cursor.getParentFile().equals(root)
            ) {
                deleteRecursively(cursor);
            }

        } catch (Throwable ignored) {
        }
    }

    private void deleteRecursively(File file) {
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteRecursively(child);
                }
            }
        }
        file.delete();
    }

    private void recordHistory(
            Task task,
            ArrayList<Uri> uris,
            String name,
            String mime
    ) {
        try {
            SharedPreferences prefs = getSharedPreferences(
                    PREFS,
                    MODE_PRIVATE
            );

            JSONArray old = new JSONArray(
                    prefs.getString(PREF_HISTORY, "[]")
            );
            JSONArray fresh = new JSONArray();

            JSONObject item = new JSONObject();
            item.put("time", System.currentTimeMillis());
            item.put("name", name);
            item.put("mime", mime);
            item.put("mode", task.mode);
            item.put("url", task.url);
            item.put("uris", urisToJson(uris));

            fresh.put(item);

            for (
                    int i = 0;
                    i < old.length() && fresh.length() < 20;
                    i++
            ) {
                fresh.put(old.get(i));
            }

            prefs.edit()
                    .putString(PREF_HISTORY, fresh.toString())
                    .apply();

        } catch (Throwable ignored) {
        }
    }

    private JSONArray urisToJson(List<Uri> uris) {
        JSONArray arr = new JSONArray();
        for (Uri uri : uris) {
            arr.put(uri.toString());
        }
        return arr;
    }

    private String mimeForName(String name) {
        String lower = name.toLowerCase(Locale.ROOT);

        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".avif")) return "image/avif";
        if (lower.endsWith(".heic") || lower.endsWith(".heif")) {
            return "image/heif";
        }
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".m4v")) return "video/x-m4v";
        if (lower.endsWith(".mkv")) return "video/x-matroska";

        return "application/octet-stream";
    }

    private String progressDetails(
            long downloaded,
            long total,
            long speed,
            long eta
    ) {
        StringBuilder builder = new StringBuilder();

        if (downloaded > 0) {
            builder.append(formatBytes(downloaded));
        }

        if (total > 0) {
            if (builder.length() > 0) builder.append(" / ");
            builder.append(formatBytes(total));
        }

        if (speed > 0) {
            if (builder.length() > 0) builder.append(" · ");
            builder.append(formatBytes(speed)).append("/с");
        }

        if (eta >= 0) {
            if (builder.length() > 0) builder.append(" · ");
            builder.append("~").append(formatEta(eta));
        }

        return builder.toString();
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " Б";

        double kb = bytes / 1024.0;
        if (kb < 1024) {
            return String.format(
                    Locale.getDefault(),
                    "%.1f КБ",
                    kb
            );
        }

        double mb = kb / 1024.0;
        if (mb < 1024) {
            return String.format(
                    Locale.getDefault(),
                    "%.1f МБ",
                    mb
            );
        }

        return String.format(
                Locale.getDefault(),
                "%.2f ГБ",
                mb / 1024.0
        );
    }

    private String formatEta(long seconds) {
        if (seconds < 60) return seconds + " с";

        long minutes = seconds / 60;
        long rest = seconds % 60;
        return minutes + " мин " + rest + " с";
    }

    private String shorten(String value, int max) {
        if (value == null) return "Ошибка";
        return value.length() <= max
                ? value
                : value.substring(0, max - 1) + "…";
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
