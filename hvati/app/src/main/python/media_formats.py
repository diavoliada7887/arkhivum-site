"""Format policy shared by downloads and metadata-only size estimates."""

YOUTUBE_AUDIO = "bestaudio[ext=m4a]/bestaudio/best"


def is_youtube(url):
    return any(host in (url or "").lower() for host in (
        "youtube.com/", "youtu.be/", "youtube-nocookie.com/",
    ))


def video_format(mode, youtube):
    if youtube:
        if mode == "best":
            return "bestvideo[ext=mp4]/best[ext=mp4]/bestvideo/best"
        limit = {"240": 240, "480": 480, "720": 720, "1080": 1080}.get(mode, 480)
        return (
            f"bestvideo[height<={limit}][ext=mp4]/"
            f"best[height<={limit}][ext=mp4]/"
            f"bestvideo[height<={limit}]/"
            f"best[height<={limit}]/best"
        )
    if mode == "best":
        return "best[ext=mp4]/best"
    limit = {"240": 240, "480": 480, "720": 720, "1080": 1080}.get(mode, 480)
    return f"best[height<={limit}][ext=mp4]/best[height<={limit}]/best"
