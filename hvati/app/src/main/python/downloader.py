import glob
import os
import time

from yt_dlp import YoutubeDL


def _write_progress(path, percent, stage, downloaded=0, total=0, speed=0, eta=-1):
    tmp = path + ".tmp"
    line = f"{int(percent)}\t{stage}\t{int(downloaded or 0)}\t{int(total or 0)}\t{int(speed or 0)}\t{int(eta if eta is not None else -1)}"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(line)
    os.replace(tmp, path)


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

    is_youtube = any(host in url.lower() for host in (
        "youtube.com/",
        "youtu.be/",
        "youtube-nocookie.com/",
    ))

    if is_youtube:
        # YouTube increasingly hides formats behind JS challenges. In the
        # no-FFmpeg/no-JS-runtime build, ask for the Android client and prefer
        # a single playable stream. This keeps Shorts useful until v0.7 adds
        # a JS runtime + stream merging.
        formats = {
            "480": "best[height<=480]/best",
            "720": "best[height<=720]/best",
            "best": "best",
        }
    else:
        formats = {
            "480": "best[height<=480][ext=mp4]/best[height<=480]/best",
            "720": "best[height<=720][ext=mp4]/best[height<=720]/best",
            "best": "best[ext=mp4]/best",
        }

    fmt = formats.get(mode, formats["480"])

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
                percent = max(0, min(95, int(downloaded * 95 / total)))
            else:
                frag_i = d.get("fragment_index") or 0
                frag_n = d.get("fragment_count") or 0
                if frag_n > 0:
                    percent = max(0, min(95, int(frag_i * 95 / frag_n)))

            _write_progress(
                progress_path,
                percent,
                "Скачиваю…",
                downloaded,
                total,
                speed,
                eta if eta is not None else -1,
            )

        elif status == "finished":
            _write_progress(
                progress_path,
                96,
                "Файл скачан. Подготавливаю…",
                d.get("downloaded_bytes") or 0,
                d.get("total_bytes") or d.get("total_bytes_estimate") or 0,
                0,
                0,
            )

    opts = {
        "format": fmt,
        "outtmpl": os.path.join(outdir, "%(title).80s [%(id)s].%(ext)s"),
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

    before = time.time()
    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        prepared = ydl.prepare_filename(info)

    if os.path.exists(prepared):
        _write_progress(progress_path, 97, "Сохраняю в Downloads…")
        return prepared

    files = [
        p for p in glob.glob(os.path.join(outdir, "*"))
        if os.path.isfile(p) and os.path.getmtime(p) >= before - 2
    ]
    if not files:
        raise RuntimeError("yt-dlp закончил работу, но файл не найден")

    files.sort(key=os.path.getmtime, reverse=True)
    _write_progress(progress_path, 97, "Сохраняю в Downloads…")
    return files[0]
