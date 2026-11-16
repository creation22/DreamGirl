"""Prepare the landing page photograph.

    python scripts/prepare_night.py path/to/photo.jpg

Writes public/night/bg.jpg: a black-and-white copy sized for the web.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps


def main(src: str) -> None:
    out = Path(__file__).resolve().parent.parent / "public" / "night"
    out.mkdir(parents=True, exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src)).convert("L").convert("RGB")
    im.thumbnail((2000, 2000), Image.LANCZOS)
    path = out / "bg.jpg"
    im.save(path, "JPEG", quality=84, optimize=True, progressive=True)
    print(f"{path.name}: {im.size}, {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
