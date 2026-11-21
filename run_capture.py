import os
import subprocess
import hashlib
from PIL import Image, ImageStat

CHROMIUM_PATH = "/root/makefun-re/art-tools/chromium/chrome-linux/chrome"
PORT = 8931
BASE_URL = f"http://127.0.0.1:{PORT}/index.html"

SHOTS = [
    ("1-cover.jpg", "cover", "1280,720"),
    ("2-editor.jpg", "editor", "1280,800"),
    ("3-panels.jpg", "panels", "1280,800"),
    ("4-sizes.jpg", "sizes", "1280,720")
]

os.makedirs("screenshots", exist_ok=True)

for filename, shot_name, win_size in SHOTS:
    url = f"{BASE_URL}?shot={shot_name}"
    tmp_png = f"screenshots/tmp_{shot_name}.png"
    out_jpg = f"screenshots/{filename}"
    udata = f"/tmp/chrome-{shot_name}"

    cmd = [
        CHROMIUM_PATH,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        f"--user-data-dir={udata}",
        f"--window-size={win_size}",
        "--virtual-time-budget=15000",
        f"--screenshot={tmp_png}",
        url
    ]
    print(f"Capturing {shot_name} ({win_size}) -> {filename}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        print(f"Error capturing {shot_name}: {res.stderr.decode()}")

    # Convert to JPEG with quality 82
    if os.path.exists(tmp_png):
        img = Image.open(tmp_png).convert("RGB")
        quality = 82
        img.save(out_jpg, "JPEG", quality=quality)

        # Check size <= 262144 bytes
        size = os.path.getsize(out_jpg)
        while size > 262144 and quality > 20:
            quality -= 10
            img.save(out_jpg, "JPEG", quality=quality)
            size = os.path.getsize(out_jpg)
        print(f"Saved {out_jpg}: {size} bytes at quality {quality}")
        os.remove(tmp_png)
    else:
        print(f"Warning: {tmp_png} not found.")

# Verification step
hashes = {}
sizes = {}
for filename, _, _ in SHOTS:
    path = os.path.join("screenshots", filename)
    if os.path.exists(path):
        size = os.path.getsize(path)
        sizes[filename] = size
        with open(path, "rb") as f:
            h = hashlib.sha256(f.read()).hexdigest()
            hashes[filename] = h
        print(f"{filename}: size={size}, sha256={h}")
    else:
        print(f"Missing {path}")

# Checks
assert hashes.get("2-editor.jpg") != hashes.get("3-panels.jpg"), "EDITOR AND PANELS ARE DUPLICATES!"
assert hashes.get("1-cover.jpg") != hashes.get("4-sizes.jpg"), "COVER AND SIZES ARE DUPLICATES!"

# PIL check on 1-cover.jpg for colourfulness / non-uniformity
cover_path = "screenshots/1-cover.jpg"
if os.path.exists(cover_path):
    img = Image.open(cover_path).convert("RGB")
    stat = ImageStat.Stat(img)
    print(f"Cover image stddev per channel: {stat.stddev}")
    assert all(s > 5 for s in stat.stddev), f"Cover image appears uniform/blank: stddev={stat.stddev}"

print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")

# Kill the HTTP server on port 8931
subprocess.run(["fuser", "-k", "8931/tcp"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Print final one-line summary
summary_parts = []
for filename, _, _ in SHOTS:
    h_prefix = hashes[filename][:12]
    sz = sizes[filename]
    summary_parts.append(f"{filename}={h_prefix} ({sz}b)")
print(", ".join(summary_parts))
