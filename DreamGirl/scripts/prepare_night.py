"""Prepare the hero photograph for the site.

    python scripts/prepare_night.py path/to/photo.jpg

Writes three cuts into public/night/:
  bg.jpg       the full frame, black and white, for the landing page
  bg-blur.jpg  small, blurred and darkened, fixed behind the other pages
  glow.jpg     a crop of her glowing silhouette, for the quiz and the "painting" state
"""
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

# Where she stands in the frame, as fractions of width and height (left, top, right, bottom).
GLOW_BOX = (0.36, 0.20, 0.82, 0.92)


def main(src: str) -> None:
    out = Path(__file__).resolve().parent.parent / "public" / "night"
    out.mkdir(parents=True, exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src)).convert("L").convert("RGB")
    w, h = im.size

    full = im.copy()
    full.thumbnail((2000, 2000), Image.LANCZOS)
    full.save(out / "bg.jpg", "JPEG", quality=84, optimize=True, progressive=True)

    blur = im.copy()
    blur.thumbnail((720, 720), Image.LANCZOS)
    blur = blur.filter(ImageFilter.GaussianBlur(14))
    blur = ImageEnhance.Brightness(blur).enhance(0.75)
    blur.save(out / "bg-blur.jpg", "JPEG", quality=72, optimize=True, progressive=True)

    l, t, r, b = GLOW_BOX
    glow = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
    glow.thumbnail((900, 1300), Image.LANCZOS)
    glow.save(out / "glow.jpg", "JPEG", quality=84, optimize=True, progressive=True)

    for f in ("bg.jpg", "bg-blur.jpg", "glow.jpg"):
        p = out / f
        print(f"{p.name}: {Image.open(p).size}, {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
