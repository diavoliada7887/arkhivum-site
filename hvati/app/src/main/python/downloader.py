import glob
import os
import time

from yt_dlp import YoutubeDL


def download(url, mode, outdir):
    os.makedirs(outdir, exist_ok=True)

    for old in glob.glob(os.path.join(outdir, "*")):
        try:
            if os.path.isfile(old):
                os.remove(old)
        except OSError:
            pass

    formats = {
        "480": "best[height<=480][ext=mp4]/best[height<=480]/best",
        "720": "best[height<=720][ext=mp4]/best[height<=720]/best",
        "best": "best[ext=mp4]/best",
    }
    fmt = formats.get(mode, formats["480"])

    opts = {
        "format": fmt,
        "outtmpl": os.path.join(outdir, "%(title).80s [%(id)s].%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "overwrites": True,
        "restrictfilenames": False,
    }

    before = time.time()
    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        prepared = ydl.prepare_filename(info)

    if os.path.exists(prepared):
        return prepared

    files = [
        p for p in glob.glob(os.path.join(outdir, "*"))
        if os.path.isfile(p) and os.path.getmtime(p) >= before - 2
    ]
    if not files:
        raise RuntimeError("yt-dlp закончил работу, но файл не найден")

    files.sort(key=os.path.getmtime, reverse=True)
    return files[0]
