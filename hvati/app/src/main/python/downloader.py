import glob
import json
import os
import time

from yt_dlp import YoutubeDL
from yt_dlp.utils import sanitize_filename


def _write_progress(path, percent, stage, downloaded=0, total=0, speed=0, eta=-1):
    tmp = path + ".tmp"
    line = f"{int(percent)}\t{stage}\t{int(downloaded or 0)}\t{int(total or 0)}\t{int(speed or 0)}\t{int(eta if eta is not None else -1)}"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(line)
    os.replace(tmp, path)


def _hook(progress_path, stage, start_percent, end_percent):
    last_update = [0.0]

    def hook(d):
        now = time.monotonic()
        status = d.get("status")

        if status == "downloading":
            if now - last_update[0] < 0.15:
                return
            last_update[0] = now

            downloaded = d.get("downloaded_bytes") or 0
            total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
            speed = d.get("speed") or 0
            eta = d.get("eta")
            percent = -1

            if total > 0:
                ratio = min(1.0, max(0.0, downloaded / total))
                percent = start_percent + int((end_percent - start_percent) * ratio)
            else:
                frag_i = d.get("fragment_index") or 0
                frag_n = d.get("fragment_count") or 0
                if frag_n > 0:
                    ratio = min(1.0, max(0.0, frag_i / frag_n))
                    percent = start_percent + int((end_percent - start_percent) * ratio)

            _write_progress(
                progress_path,
                percent,
                stage,
                downloaded,
                total,
                speed,
                eta if eta is not None else -1,
            )

        elif status == "finished":
            _write_progress(
                progress_path,
                end_percent,
                stage,
                d.get("downloaded_bytes") or 0,
                d.get("total_bytes") or d.get("total_bytes_estimate") or 0,
                0,
                0,
            )

    return hook


def _base_opts(outtmpl, hook, is_youtube):
    opts = {
        "outtmpl": outtmpl,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "overwrites": True,
        "restrictfilenames": False,
        "progress_hooks": [hook],
    }
    if is_youtube:
        opts["extractor_args"] = {
            "youtube": {
                "player_client": ["android"],
            }
        }
    return opts


def _existing_file(prepared, pattern):
    if prepared and os.path.exists(prepared):
        return prepared
    files = [p for p in glob.glob(pattern) if os.path.isfile(p)]
    if not files:
        return None
    files.sort(key=os.path.getmtime, reverse=True)
    return files[0]


def download(url, mode, outdir, progress_path):
    os.makedirs(outdir, exist_ok=True)

    for old in glob.glob(os.path.join(outdir, "*")):
        try:
            if os.path.isfile(old):
                os.remove(old)
        except OSError:
            pass

    try:
        os.remove(progress_path)
    except OSError:
        pass

    _write_progress(progress_path, 0, "Получаю данные…")

    lower_url = url.lower()
    is_youtube = any(host in lower_url for host in (
        "youtube.com/",
        "youtu.be/",
        "youtube-nocookie.com/",
    ))

    if mode == "mp3":
        opts = _base_opts(
            os.path.join(outdir, "audio.%(ext)s"),
            _hook(progress_path, "Скачиваю аудио…", 0, 92),
            is_youtube,
        )
        opts["format"] = "bestaudio/best"

        with YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
            prepared = ydl.prepare_filename(info)

        source = _existing_file(prepared, os.path.join(outdir, "audio.*"))
        if not source:
            raise RuntimeError("Не нашёл скачанный аудиофайл")

        title = sanitize_filename(info.get("title") or "audio", restricted=False)[:80]
        video_id = info.get("id") or "download"
        output_name = f"{title} [{video_id}].mp3"

        _write_progress(progress_path, 94, "Конвертирую в MP3…")
        return json.dumps({
            "kind": "mp3",
            "source": source,
            "output_name": output_name,
        }, ensure_ascii=False)

    if is_youtube:
        limits = {
            "480": 480,
            "720": 720,
            "best": 2160,
        }
        limit = limits.get(mode, 480)

        video_opts = _base_opts(
            os.path.join(outdir, "video.%(ext)s"),
            _hook(progress_path, "Скачиваю видео…", 0, 68),
            True,
        )
        if mode == "best":
            video_opts["format"] = "bestvideo[ext=mp4]/best[ext=mp4]/bestvideo/best"
        else:
            video_opts["format"] = (
                f"bestvideo[height<={limit}][ext=mp4]/"
                f"best[height<={limit}][ext=mp4]/"
                f"bestvideo[height<={limit}]/"
                f"best[height<={limit}]/best"
            )

        with YoutubeDL(video_opts) as ydl:
            video_info = ydl.extract_info(url, download=True)
            video_prepared = ydl.prepare_filename(video_info)

        video_path = _existing_file(video_prepared, os.path.join(outdir, "video.*"))
        if not video_path:
            raise RuntimeError("Не нашёл видеопоток")

        audio_opts = _base_opts(
            os.path.join(outdir, "audio.%(ext)s"),
            _hook(progress_path, "Скачиваю звук…", 68, 94),
            True,
        )
        audio_opts["format"] = "bestaudio[ext=m4a]/bestaudio/best"

        with YoutubeDL(audio_opts) as ydl:
            audio_info = ydl.extract_info(url, download=True)
            audio_prepared = ydl.prepare_filename(audio_info)

        audio_path = _existing_file(audio_prepared, os.path.join(outdir, "audio.*"))
        if not audio_path:
            raise RuntimeError("Не нашёл аудиопоток")

        title = sanitize_filename(video_info.get("title") or "video", restricted=False)[:80]
        video_id = video_info.get("id") or "download"
        output_name = f"{title} [{video_id}].mp4"

        _write_progress(progress_path, 95, "Склеиваю видео и звук…")
        return json.dumps({
            "kind": "merge",
            "video": video_path,
            "audio": audio_path,
            "output_name": output_name,
        }, ensure_ascii=False)

    formats = {
        "480": "best[height<=480][ext=mp4]/best[height<=480]/best",
        "720": "best[height<=720][ext=mp4]/best[height<=720]/best",
        "best": "best[ext=mp4]/best",
    }
    fmt = formats.get(mode, formats["480"])

    opts = _base_opts(
        os.path.join(outdir, "%(title).80s [%(id)s].%(ext)s"),
        _hook(progress_path, "Скачиваю…", 0, 95),
        False,
    )
    opts["format"] = fmt

    before = time.time()
    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        prepared = ydl.prepare_filename(info)

    source = _existing_file(prepared, os.path.join(outdir, "*"))
    if not source:
        files = [
            p for p in glob.glob(os.path.join(outdir, "*"))
            if os.path.isfile(p) and os.path.getmtime(p) >= before - 2
        ]
        if not files:
            raise RuntimeError("yt-dlp закончил работу, но файл не найден")
        files.sort(key=os.path.getmtime, reverse=True)
        source = files[0]

    _write_progress(progress_path, 97, "Сохраняю в Downloads…")
    return json.dumps({
        "kind": "single",
        "source": source,
        "output_name": os.path.basename(source),
    }, ensure_ascii=False)
