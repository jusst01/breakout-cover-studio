import os
import hashlib
from PIL import Image, ImageStat

files = [
    "screenshots/1-cover.jpg",
    "screenshots/2-editor.jpg",
    "screenshots/3-panels.jpg",
    "screenshots/4-sizes.jpg"
]

hashes = {}
sizes = {}

for f in files:
    if not os.path.exists(f):
        print(f"ERROR: {f} missing!")
        exit(1)
    sizes[f] = os.path.getsize(f)
    if sizes[f] > 262144:
        print(f"ERROR: {f} exceeds 256KB ({sizes[f]} bytes)")
        exit(1)
    with open(f, "rb") as fh:
        h = hashlib.sha256(fh.read()).hexdigest()
        hashes[f] = h

print("File sizes and sha256 sums:")
for f in files:
    print(f"{f}: size={sizes[f]}, sha256={hashes[f]}")

# Verification checks
assert hashes["screenshots/2-editor.jpg"] != hashes["screenshots/3-panels.jpg"], "FAIL: 2-editor.jpg and 3-panels.jpg are identical!"
assert hashes["screenshots/1-cover.jpg"] != hashes["screenshots/4-sizes.jpg"], "FAIL: 1-cover.jpg and 4-sizes.jpg are identical!"

# PIL check on 1-cover.jpg: colourful and non-uniform
img1 = Image.open("screenshots/1-cover.jpg").convert("RGB")
stat = ImageStat.Stat(img1)
# Check standard deviation (non-uniformity)
stddev = stat.stddev
print(f"1-cover.jpg stddev per channel (R, G, B): {stddev}")
assert all(s > 10 for s in stddev), f"FAIL: 1-cover.jpg appears uniform (stddev: {stddev})"

print("SUCCESS: All verification checks passed!")
