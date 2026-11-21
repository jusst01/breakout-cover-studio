import subprocess
import time
import os
import hashlib
from PIL import Image, ImageStat

MODES = {
    "cover": (1280, 720),
    "sizes": (1280, 720)
}

PORT = 8947
CHROME_PATH = "/root/makefun-re/art-tools/chromium/chrome-linux/chrome"
READY_MODES = []

def run_command(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

for mode, (width, height) in MODES.items():
    print(f"Processing {mode}...")
    ready = False
    for attempt in range(6):
        cmd = f"{CHROME_PATH} --headless --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size={width},{height} --virtual-time-budget=100000 --dump-dom 'http://127.0.0.1:{PORT}/index.html?shot={mode}'"
        result = run_command(cmd)

        if "SHOT-READY" in result.stdout:
            print(f"  {mode} is ready.")
            capture_cmd = f"{CHROME_PATH} --headless --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size={width},{height} --virtual-time-budget=20000 --screenshot=/tmp/lf6-{mode}.png 'http://127.0.0.1:{PORT}/index.html?shot={mode}'"
            run_command(capture_cmd)
            ready = True
            READY_MODES.append(mode)
            break
        else:
            print(f"  {mode} not ready (attempt {attempt+1})")
            time.sleep(3)

    if not ready:
        print(f"  {mode} never became ready.")

mapping = {
    "cover": "1-cover.jpg",
    "sizes": "4-sizes.jpg"
}

for mode in READY_MODES:
    img_path = f"/tmp/lf6-{mode}.png"
    if os.path.exists(img_path):
        img = Image.open(img_path)
        out_path = f"screenshots/{mapping[mode]}"
        img.save(out_path, "JPEG", quality=82)

# Check file sizes
for mode, filename in mapping.items():
    path = f"screenshots/{filename}"
    if os.path.exists(path):
        size = os.path.getsize(path)
        print(f"{filename} size: {size} bytes")
        if size > 262144:
            print(f"ERROR: {filename} exceeds 262144 bytes ({size})!")
    else:
        print(f"ERROR: {filename} missing!")

# Verification checks
print("Running verification checks...")

def sha256(fname):
    h = hashlib.sha256()
    with open(fname, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()

files_to_check = ["1-cover.jpg", "2-editor.jpg", "3-panels.jpg", "4-sizes.jpg"]
for f in files_to_check:
    current_hash = sha256(f"screenshots/{f}")
    backup_hash = sha256(f"/root/makefun-cover-lively/shots-backup-lf6/{f}")
    print(f"{f}: current={current_hash}, backup={backup_hash}")
    if f in ["1-cover.jpg", "4-sizes.jpg"]:
        if current_hash == backup_hash:
            print(f"ERROR: {f} did not change from backup!")
        else:
            print(f"OK: {f} changed as expected.")
    else:
        if current_hash != backup_hash:
            print(f"ERROR: {f} unexpectedly changed from backup!")
        else:
            print(f"OK: {f} untouched as expected.")

# 1-cover.jpg PIL check
cover_img = Image.open("screenshots/1-cover.jpg")
w, h = cover_img.size
left_cols_width = max(1, int(w * 0.03))
left_box = cover_img.crop((0, 0, left_cols_width, h))
stat = ImageStat.Stat(left_box.convert("L"))
mean_brightness = stat.mean[0]
print(f"1-cover.jpg leftmost 3% mean brightness: {mean_brightness}")
if mean_brightness >= 40:
    print("ERROR: Leftmost 3% mean brightness >= 40 (checkerboard detected or too bright)!")
else:
    print("OK: Leftmost 3% mean brightness under 40.")

# Distinct colors check
small_cover = cover_img.resize((100, 100))
colors = small_cover.getcolors(maxcolors=20000)
num_colors = len(colors) if colors else 20000
print(f"1-cover.jpg distinct colors (on 100x100 resize): {num_colors}")
if num_colors <= 500:
    print("ERROR: Distinct colors <= 500!")
else:
    print("OK: Distinct colors > 500.")
