"""Optional metadata only. No media downloader, postprocessing or output files."""
import json
import math

from yt_dlp import YoutubeDL
from media_formats import YOUTUBE_AUDIO, is_youtube, video_format


def _positive(value):
    try:
        value = float(value)
        return value if math.isfinite(value) and value > 0 else 0
    except (TypeError, ValueError, OverflowError):
        return 0


def _size_of(fmt, duration):
    if not fmt:
        return 0
    for key in ("filesize", "filesize_approx"):
        size = _positive(fmt.get(key))
        if size:
            return int(size)
    rate = _positive(fmt.get("tbr"))
    if not rate:
        rate = _positive(fmt.get("vbr")) + _positive(fmt.get("abr"))
    duration = _positive(fmt.get("duration")) or _positive(duration)
    return int(rate * 1000 / 8 * duration) if rate and duration else 0


def _select(ydl, formats, spec):
    # yt-dlp has already sorted these formats by its own preference policy.
    # Use its selector, not a separate height/bitrate approximation of 'best'.
    selector = ydl.build_format_selector(spec)
    context = {
        "formats": formats,
        "has_merged_format": any(
            "none" not in (f.get("acodec"), f.get("vcodec")) for f in formats),
        "incomplete_formats": (
            all(f.get("vcodec") == "none" for f in formats)
            or all(f.get("acodec") == "none" for f in formats)),
    }
    return next(iter(selector(context)), None)


def estimate(ydl, info, youtube):
    # A carousel/playlist can contain several different files. Do not label it
    # with the first slide's size, or accidentally expand the whole playlist.
    if not info or info.get("_type") in ("playlist", "multi_video"):
        return {}
    formats = info.get("formats") or ([info] if info.get("url") else [])
    duration = _positive(info.get("duration"))
    result = {}
    audio = _select(ydl, formats, YOUTUBE_AUDIO) if youtube else None
    for mode in ("240", "480", "720", "1080"):
        selected = _select(ydl, formats, video_format(mode, youtube))
        size = _size_of(selected, duration)
        if youtube:
            audio_size = _size_of(audio, duration)
            # A partial estimate is misleading; leave the label alone unless
            # both streams can be estimated. Mux/container overhead is ignored.
            size = size + audio_size if size and audio_size else 0
        result[mode] = size
    result["mp3"] = int(duration * 192000 / 8) if duration else 0
    return result


def probe(url):
    youtube = is_youtube(url)
    opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "extract_flat": "in_playlist",
        "playlistend": 1,
        "skip_download": True,
        "cachedir": False,
        "check_formats": False,
        "format": "best",
        "ignore_no_formats_error": True,
        "socket_timeout": 12,
        "retries": 0,
        "extractor_retries": 0,
    }
    if youtube:
        opts["extractor_args"] = {"youtube": {"player_client": ["android"]}}
    try:
        with YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return json.dumps(estimate(ydl, info, youtube), ensure_ascii=False)
    except Exception:
        return "{}"
