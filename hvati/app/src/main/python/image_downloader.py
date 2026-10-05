import hashlib
import html
import json
import os
import re
import time
from html.parser import HTMLParser
from urllib.parse import urlparse

import requests
from instaloader import Instaloader, Post


MEDIA_EXTS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic",
    ".mp4", ".mov", ".m4v", ".webm",
}


def _write_progress(path, percent, stage, downloaded=0, total=0, speed=0, eta=-1):
    tmp = path + ".tmp"
    line = f"{int(percent)}\t{stage}\t{int(downloaded or 0)}\t{int(total or 0)}\t{int(speed or 0)}\t{int(eta if eta is not None else -1)}"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(line)
    os.replace(tmp, path)


def _session_dir(root, url):
    os.makedirs(root, exist_ok=True)
    key = hashlib.sha256(("images|" + url).encode("utf-8")).hexdigest()[:18]
    path = os.path.join(root, key)
    os.makedirs(path, exist_ok=True)
    return path


def _media_files(path):
    result = []
    for root, _, names in os.walk(path):
        for name in names:
            full = os.path.join(root, name)
            ext = os.path.splitext(name)[1].lower()
            if ext in MEDIA_EXTS and os.path.isfile(full):
                result.append(full)
    result.sort(key=lambda p: (os.path.getmtime(p), p))
    return result


def _instagram_shortcode(url):
    match = re.search(r"/(?:p|reel|tv)/([A-Za-z0-9_-]+)", url)
    return match.group(1) if match else None


def _download_instagram(url, outdir, progress_path):
    shortcode = _instagram_shortcode(url)
    if not shortcode:
        raise RuntimeError("Не вижу shortcode Instagram в ссылке")

    _write_progress(progress_path, -1, "Разбираю Instagram-карусель…")

    loader = Instaloader(
        sleep=False,
        quiet=True,
        dirname_pattern=outdir,
        filename_pattern="{shortcode}_{date_utc}",
        download_pictures=True,
        download_videos=True,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        post_metadata_txt_pattern="",
        max_connection_attempts=8,
        request_timeout=45.0,
        sanitize_paths=True,
    )

    post = Post.from_shortcode(loader.context, shortcode)

    _write_progress(progress_path, -1, "Скачиваю все слайды карусели…")
    ok = loader.download_post(post, target="hvati")
    files = _media_files(outdir)

    if not files:
        if ok is False:
            raise RuntimeError("Instagram не отдал изображения")
        raise RuntimeError("Не нашёл скачанные изображения Instagram")

    _write_progress(progress_path, 90, f"Скачано файлов: {len(files)}. Сохраняю…")
    return files


class _MetaImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "meta":
            return
        data = {str(k).lower(): v for k, v in attrs if k}
        key = (data.get("property") or data.get("name") or "").lower()
        if key in ("og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"):
            value = data.get("content")
            if value:
                self.images.append(html.unescape(value))


def _guess_ext(content_type, url):
    content_type = (content_type or "").split(";", 1)[0].strip().lower()
    mapping = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
        "image/heic": ".heic",
    }
    if content_type in mapping:
        return mapping[content_type]

    ext = os.path.splitext(urlparse(url).path)[1].lower()
    return ext if ext in MEDIA_EXTS else ".jpg"


def _download_binary(session, media_url, target_base, progress_path):
    started = time.monotonic()
    with session.get(media_url, stream=True, timeout=(15, 45), allow_redirects=True) as response:
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "")
        if not content_type.lower().startswith("image/"):
            raise RuntimeError("Ссылка не отдала изображение")

        total = int(response.headers.get("Content-Length") or 0)
        ext = _guess_ext(content_type, response.url)
        target = target_base + ext

        downloaded = 0
        with open(target + ".part", "wb") as f:
            for chunk in response.iter_content(chunk_size=128 * 1024):
                if not chunk:
                    continue
                f.write(chunk)
                downloaded += len(chunk)

                elapsed = max(0.001, time.monotonic() - started)
                speed = int(downloaded / elapsed)
                percent = int(downloaded * 90 / total) if total > 0 else -1
                eta = int((total - downloaded) / speed) if total > downloaded and speed > 0 else -1
                _write_progress(
                    progress_path,
                    max(0, min(90, percent)) if percent >= 0 else -1,
                    "Скачиваю изображение…",
                    downloaded,
                    total,
                    speed,
                    eta,
                )

        os.replace(target + ".part", target)
        return target


def _download_generic(url, outdir, progress_path):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36"
        ),
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.7",
    }
    session = requests.Session()
    session.headers.update(headers)

    _write_progress(progress_path, -1, "Ищу изображение на странице…")

    response = session.get(url, timeout=(15, 45), allow_redirects=True)
    response.raise_for_status()
    content_type = (response.headers.get("Content-Type") or "").lower()

    if content_type.startswith("image/"):
        response.close()
        return [_download_binary(
            session,
            url,
            os.path.join(outdir, "image"),
            progress_path,
        )]

    parser = _MetaImageParser()
    parser.feed(response.text)

    candidates = []
    seen = set()
    for image_url in parser.images:
        if image_url.startswith("//"):
            image_url = "https:" + image_url
        if image_url.startswith("http") and image_url not in seen:
            seen.add(image_url)
            candidates.append(image_url)

    if not candidates:
        # Useful fallback for pages which keep structured image URLs in JSON.
        for raw in re.findall(r'https?:\\/\\/[^"<> ]+?(?:\\.jpg|\\.jpeg|\\.png|\\.webp)(?:[^"<> ]*)?', response.text, flags=re.I):
            image_url = html.unescape(raw.replace("\\/", "/"))
            if image_url not in seen:
                seen.add(image_url)
                candidates.append(image_url)

    if not candidates:
        raise RuntimeError("На странице не нашёл изображение")

    # For a normal web page we take the primary OpenGraph image. Instagram
    # carousels are handled above by Instaloader and return all slides.
    return [_download_binary(
        session,
        candidates[0],
        os.path.join(outdir, "image"),
        progress_path,
    )]


def download_images(url, root_dir, progress_path):
    outdir = _session_dir(root_dir, url)

    # Remove only completed media from an older successful image run.
    # Temporary .part files are kept so interrupted direct-image downloads
    # can be diagnosed rather than silently overwritten.
    for old in _media_files(outdir):
        try:
            os.remove(old)
        except OSError:
            pass

    try:
        os.remove(progress_path)
    except OSError:
        pass

    lower = url.lower()

    try:
        if "instagram.com/" in lower:
            files = _download_instagram(url, outdir, progress_path)
        else:
            files = _download_generic(url, outdir, progress_path)
    except Exception as first_error:
        # Instagram changes its public endpoints frequently. If structured
        # post extraction fails, still try the page's primary OpenGraph image.
        if "instagram.com/" not in lower:
            raise
        try:
            files = _download_generic(url, outdir, progress_path)
        except Exception:
            raise RuntimeError(f"Instagram не отдал карусель: {first_error}")

    if not files:
        raise RuntimeError("Изображения не найдены")

    _write_progress(progress_path, 90, f"Скачано файлов: {len(files)}. Сохраняю…")

    return json.dumps({
        "kind": "gallery",
        "files": files,
        "count": len(files),
    }, ensure_ascii=False)
