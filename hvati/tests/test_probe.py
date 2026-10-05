import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'app/src/main/python'))
from yt_dlp import YoutubeDL
import probe
from media_formats import video_format


def fmt(name, height=0, ext='mp4', video='h264', audio='aac', size=None, **extra):
    return dict(format_id=name, url='https://example.invalid/' + name,
                height=height, ext=ext, vcodec=video, acodec=audio,
                filesize=size, **extra)


class ProbeTests(unittest.TestCase):
    def setUp(self):
        self.ydl = YoutubeDL({'quiet': True, 'check_formats': False})

    def estimate(self, formats, youtube=False):
        return probe.estimate(self.ydl, {'formats': formats, 'duration': 100}, youtube)

    def test_youtube_sums_separate_streams(self):
        sizes = self.estimate([
            fmt('a', ext='m4a', video='none', size=100),
            fmt('v', height=720, audio='none', size=900),
        ], True)
        self.assertEqual(sizes['720'], 1000)
        self.assertEqual(sizes['mp3'], 2400000)

    def test_mp4_precedes_higher_webm_like_downloader(self):
        formats = [fmt('mp4', height=480, audio='none', size=400),
                   fmt('webm', height=720, ext='webm', audio='none', size=800)]
        selected = probe._select(self.ydl, formats, video_format('720', True))
        self.assertEqual(selected['format_id'], 'mp4')

    def test_generic_prefers_muxed_mp4(self):
        sizes = self.estimate([fmt('mp4', height=480, size=400),
                               fmt('webm', height=720, ext='webm', size=800),
                               fmt('video', height=720, audio='none', size=900)])
        self.assertEqual(sizes['720'], 400)

    def test_fallback_above_limit_matches_existing_best_fallback(self):
        self.assertEqual(self.estimate([fmt('only', height=1080, size=900)])['240'], 900)

    def test_unknown_audio_does_not_publish_partial_youtube_size(self):
        self.assertEqual(self.estimate([fmt('a', ext='m4a', video='none'),
                                       fmt('v', height=720, audio='none', size=900)], True)['720'], 0)

    def test_size_sources_and_invalid_numbers(self):
        self.assertEqual(probe._size_of({'filesize': 12, 'filesize_approx': 20}, 10), 12)
        self.assertEqual(probe._size_of({'filesize': -1, 'filesize_approx': 20}, 10), 20)
        self.assertEqual(probe._size_of({'tbr': 800}, 10), 1000000)
        self.assertEqual(probe._size_of({'vbr': 640, 'abr': 160}, 10), 1000000)
        self.assertEqual(probe._size_of({'tbr': 'nan'}, 10), 0)
        self.assertEqual(probe._size_of({}, 10), 0)

    def test_playlist_is_not_first_slide_size(self):
        self.assertEqual(probe.estimate(self.ydl, {'_type': 'playlist', 'entries': []}, False), {})

    def test_probe_never_invokes_media_downloader(self):
        # Exercise actual yt-dlp metadata processing, with only extractor IO mocked.
        info = dict(id='test', title='test', duration=10,
                    formats=[fmt('muxed', height=720, size=1234)])
        with patch.object(YoutubeDL, 'extract_info', autospec=True) as extract, \
             patch.object(YoutubeDL, 'dl', side_effect=AssertionError('media download')):
            extract.side_effect = lambda ydl, url, download: ydl.process_video_result(info, download=download)
            result = probe.probe('https://example.invalid/video')
            self.assertIn('1234', result)
            self.assertFalse(extract.call_args.kwargs['download'])

    def test_network_failure_is_silent(self):
        with patch.object(YoutubeDL, 'extract_info', side_effect=OSError('offline')):
            self.assertEqual(probe.probe('https://example.invalid/video'), '{}')


if __name__ == '__main__':
    unittest.main()
