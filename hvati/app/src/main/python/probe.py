import json
import math

from yt_dlp import YoutubeDL


def _is_youtube(url):
    low = (url or "").lower()
    return any(x in low for x in ("youtube.com/", "youtu.be/", "youtube-nocookie.com/"))


def _size_of(fmt, duration):
    if not fmt:
        return 0
    value = fmt.get("filesize") or fmt.get("filesize_approx")
    if value:
        try:
            return int(value)
        except Exception:
            pass

    rate = fmt.get("tbr") or fmt.get("abr")
    if rate and duration:
        try:
            # yt-dlp reports kb/s in kilobits per second.
            return int(float(rate) * 1000.0 / 8.0 * float(duration))
        except Exception:
            pass
    return 0


def _video_score(fmt, limit, prefer_mp4=False, muxed=False):
    if not fmt:
        return (-1, -1, -1, -1)
    height = fmt.get("height") or 0
    if height and height > limit:
        return (-1, -1, -1, -1)

    vcodec = fmt.get("vcodec")
    acodec = fmt.get("acodec")
    if not vcodec or vcodec == "none":
        return (-1, -1, -1, -1)
    if muxed and (not acodec or acodec == "none"):
        return (-1, -1, -1, -1)
    if not muxed and acodec and acodec != "none":
        # Prefer video-only for YouTube because the downloader merges audio.
        audio_penalty = 0
    else:
        audio_penalty = 1

    ext_bonus = 1 if prefer_mp4 and fmt.get("ext") == "mp4" else 0
    return (
        int(height or 0),
        ext_bonus,
        int(fmt.get("width") or 0),
        float(fmt.get("tbr") or 0),
    )


def _best_audio(formats):
    candidates = []
    for fmt in formats:
        if (fmt.get("vcodec") in (None, "none")
                and fmt.get("acodec") not in (None, "none")):
            candidates.append(fmt)
    if not candidates:
        return None
    return max(
        candidates,
        key=lambda f: (
            1 if f.get("ext") in ("m4a", "mp4") else 0,
            float(f.get("abr") or f.get("tbr") or 0),
            int(f.get("filesize") or f.get("filesize_approx") or 0),
        ),
    )


def _best_video_only(formats, limit):
    candidates = [
        f for f in formats
        if f.get("vcodec") not in (None, "none")
        and f.get("acodec") in (None, "none")
        and (not f.get("height") or f.get("height") <= limit)
    ]
    if not candidates:
        return None
    return max(
        candidates,
        key=lambda f: (
            int(f.get("height") or 0),
            1 if f.get("ext") == "mp4" else 0,
            int(f.get("width") or 0),
            float(f.get("tbr") or 0),
        ),
    )


def _best_muxed(formats, limit):
    candidates = [
        f for f in formats
        if f.get("vcodec") not in (None, "none")
        and f.get("acodec") not in (None, "none")
        and (not f.get("height") or f.get("height") <= limit)
    ]
    if not candidates:
        return None
    return max(
        candidates,
        key=lambda f: (
            int(f.get("height") or 0),
            1 if f.get("ext") == "mp4" else 0,
            int(f.get("width") or 0),
            float(f.get("tbr") or 0),
        ),
    )


def probe(url):
    opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "skip_download": True,
        "socket_timeout": 15,
        "retries": 1,
        "extractor_retries": 1,
    }

    youtube = _is_youtube(url)
    if youtube:
        opts["extractor_args"] = {
            "youtube": {
                "player_client": ["android"],
            }
        }

    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)

    if info and info.get("_type") == "playlist":
        entries = info.get("entries") or []
        info = next((x for x in entries if x), info)

    formats = (info or {}).get("formats") or []
    duration = (info or {}).get("duration") or 0

    result = {
        "title": (info or {}).get("title") or "",
        "duration": duration,
    }

    audio = _best_audio(formats)

    for mode, limit in (("240", 240), ("480", 480), ("720", 720), ("1080", 1080)):
        size = 0
        if youtube:
            video = _best_video_only(formats, limit)
            if video:
                size += _size_of(video, duration)
                size += _size_of(audio, duration)
            else:
                size = _size_of(_best_muxed(formats, limit), duration)
        else:
            size = _size_of(_best_muxed(formats, limit), duration)
            if not size:
                size = _size_of(_best_video_only(formats, limit), duration)
                if size and audio:
                    size += _size_of(audio, duration)

        result[mode] = int(size or 0)

    # libmp3lame q:a 2 usually lands around 170-210 kbps. 192 kbps is
    # deliberately only an estimate for the UI.
    result["mp3"] = int(float(duration or 0) * 192000.0 / 8.0) if duration else 0

    return json.dumps(result, ensure_ascii=False)
