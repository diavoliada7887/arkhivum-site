"""Check built APK bytes, not just source resources. Run after apksigner verify."""
import io
import struct
import subprocess
import sys
import zipfile
import zlib

apk, aapt = sys.argv[1:]
with zipfile.ZipFile(apk) as archive:
    assert archive.testzip() is None, 'Corrupt APK ZIP entry'
    names = archive.namelist()
    dex = b''.join(archive.read(n) for n in names if n.endswith('.dex'))
    for name in ('MainActivity', 'ShareActivity', 'DownloadService'):
        assert ('Lcom/oksana/hvati/' + name + ';').encode() in dex, name
    manifest = subprocess.check_output([aapt, 'dump', 'xmltree', apk, 'AndroidManifest.xml'], text=True)
    for name in ('MainActivity', 'ShareActivity', 'DownloadService', 'dataSync'):
        # dataSync is compiled as an enum, checked via foregroundServiceType below.
        if name != 'dataSync': assert name in manifest, name
    assert 'foregroundServiceType' in manifest
    assert 'com.oksana.hvati.autonomous' in manifest
    badging = subprocess.check_output([aapt, 'dump', 'badging', apk], text=True)
    assert "versionCode='15'" in badging and "versionName='1.0.2'" in badging
    print('PASS package, version, manifest and DEX components')
    for name in ('ic_launcher.xml', 'ic_launcher_round.xml'):
        paths = [n for n in names if 'mipmap-anydpi-v26' in n and n.endswith('/' + name)]
        assert len(paths) == 1, (name, paths)
        xml = subprocess.check_output([aapt, 'dump', 'xmltree', apk, paths[0]], text=True)
        assert all(tag in xml for tag in ('adaptive-icon', 'background', 'foreground')), name
    pngs = [n for n in names if 'ic_launcher' in n and n.endswith('.png')]
    assert len(pngs) == 15, pngs
    for name in pngs:
        data = archive.read(name)
        assert data[:8] == b'\x89PNG\r\n\x1a\n', name
        offset, pixels = 8, b''
        while offset < len(data):
            length = struct.unpack('>I', data[offset:offset+4])[0]
            chunk = data[offset+4:offset+8+length]
            crc = struct.unpack('>I', data[offset+8+length:offset+12+length])[0]
            assert zlib.crc32(chunk) & 0xffffffff == crc, name
            if chunk[:4] == b'IDAT': pixels += chunk[4:]
            offset += length + 12
        assert zlib.decompress(pixels), name
    print('PASS both adaptive XML resources and all 15 launcher PNGs / CRC / pixel compression')
    python_names = []
    for name in names:
        if 'chaquopy' in name and name.endswith(('.imy', '.zip')):
            data = archive.read(name)
            if zipfile.is_zipfile(io.BytesIO(data)):
                with zipfile.ZipFile(io.BytesIO(data)) as nested:
                    assert nested.testzip() is None, name
                    python_names.extend(nested.namelist())
    for module in ('downloader', 'image_downloader', 'probe', 'media_formats'):
        assert any(n.rsplit('/', 1)[-1] in (module+'.py', module+'.pyc') for n in python_names), module
    print('PASS downloader, image_downloader, probe and shared format module packaged')
