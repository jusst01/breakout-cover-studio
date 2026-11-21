import subprocess
import time
import os
from PIL import Image

MODES = {
    "cover": (1280, 720),
    "editor": (1280, 800),
    "panels": (1280, 800),
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
        # Dump DOM
        cmd = f"{CHROME_PATH} --headless --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size={width},{height} --virtual-time-budget=100000 --dump-dom 'http://127.0.0.1:{PORT}/index.html?shot={mode}'"
        result = run_command(cmd)

        if "SHOT-READY" in result.stdout:
            print(f"  {mode} is ready.")
            # Capture
            capture_cmd = f"{CHROME_PATH} --headless --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size={width},{height} --virtual-time-budget=20000 --screenshot=/tmp/lf4-{mode}.png 'http://127.0.0.1:{PORT}/index.html?shot={mode}'"
            run_command(capture_cmd)
            ready = True
            READY_MODES.append(mode)
            break
        else:
            print(f"  {mode} not ready (attempt {attempt+1})")
            time.sleep(3)

    if not ready:
        print(f"  {mode} never became ready.")

# Convert to JPG and verify
# 1-cover.jpg, 2-editor.jpg, 3-panels.jpg, 4-sizes.jpg
mapping = {
    "cover": "1-cover.jpg",
    "editor": "2-editor.jpg",
    "panels": "3-panels.jpg",
    "sizes": "4-sizes.jpg"
}

for mode in READY_MODES:
    img = Image.open(f"/tmp/lf4-{mode}.png")
    # Resize to something smaller for color check if it's the cover
    if mode == "cover":
        img.save(f"screenshots/{mapping[mode]}", "JPEG", quality=82)
    else:
        img.save(f"screenshots/{mapping[mode]}", "JPEG", quality=82)

# Check sizes
for mode in READY_MODES:
    size = os.path.getsize(f"screenshots/{mapping[mode]}")
    if size > 262144:
        print(f"Warning: {mapping[mode]} too large ({size} bytes)")
    print(f"{mapping[mode]} size: {size}")

# Colorfulness check for cover
if "cover" in READY_MODES:
    img = Image.open("screenshots/1-cover.jpg")
    img_small = img.resize((100, 100))
    # Count distinct colors
    colors = img_small.getcolors(maxcolors=10000)
    print(f"Distinct colors in cover: {len(colors)}")
    if len(colors) <= 500:
        print("Colorfulness check failed for cover.")
    else:
        print("Colorfulness check passed.")

print(f"Ready modes: {READY_MODES}")
