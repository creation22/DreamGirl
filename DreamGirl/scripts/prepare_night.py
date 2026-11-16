"""Prepare the landing page photograph.

    python scripts/prepare_night.py path/to/photo.jpg

Writes two black-and-white files into public/night/:
  bg.jpg    the full frame, for the landing page
  glow.jpg  a crop of her glowing silhouette, used inside the app
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

# Where she stands in the frame, as fractions of width and height (left, top, right, bottom).
GLOW_BOX = (0.36, 0.20, 0.82, 0.92)


def main(src: str) -> None:
    out = Path(__file__).resolve().parent.parent / "public" / "night"
    out.mkdir(parents=True, exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src)).convert("L").convert("RGB")
    w, h = im.size
    l, t, r, b = GLOW_BOX
    glow = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
    full = im.copy()
    full.thumbnail((2000, 2000), Image.LANCZOS)
    glow.thumbnail((900, 1300), Image.LANCZOS)
    for name, pic in (("bg.jpg", full), ("glow.jpg", glow)):
        path = out / name
        pic.save(path, "JPEG", quality=84, optimize=True, progressive=True)
        print(f"{path.name}: {pic.size}, {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
