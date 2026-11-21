import subprocess
import os
from PIL import Image
import hashlib

CHROMIUM = "/root/makefun-re/art-tools/chromium/chrome-linux/chrome"
PORT = 8931
BASE_URL = f"http://127.0.0.1:{PORT}/index.html"

shots = [
    ("1-cover.jpg", "cover", "1280,720"),
    ("2-editor.jpg", "editor", "1280,800"),
    ("3-panels.jpg", "panels", "1280,800"),
    ("4-sizes.jpg", "sizes", "1280,720"),
]

os.makedirs("screenshots", exist_ok=True)

for filename, shot_name, window_size in shots:
    url = f"{BASE_URL}?shot={shot_name}"
    tmp_png = f"/tmp/{filename}.png"
    out_jpg = os.path.join("screenshots", filename)

    cmd = [
        CHROMIUM,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        f"--window-size={window_size}",
        f"--screenshot={tmp_png}",
        "--virtual-time-budget=15000",
        url
    ]
    print(f"Capturing {shot_name} (size {window_size})...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Chromium stderr: {res.stderr}")

    if not os.path.exists(tmp_png):
        raise RuntimeError(f"Failed to capture {tmp_png}")

    # Convert to JPEG with quality 82, ensuring <= 262144 bytes
    img = Image.open(tmp_png).convert("RGB")
    quality = 82
    while True:
        img.save(out_jpg, "JPEG", quality=quality)
        size = os.path.getsize(out_jpg)
        if size <= 262144 or quality <= 10:
            break
        quality -= 5
    print(f"Saved {out_jpg}: {size} bytes at quality {quality}")

print("All captures completed.")
