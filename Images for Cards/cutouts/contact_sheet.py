"""Build a side-by-side contact sheet so Oak can verify cutouts visually.

For each of the six icons, places: [source] [isnet-general-use] [u2net]
in one row. Outputs are downscaled to fit on screen but the source
PNGs in cutouts/ remain full-resolution.

Two contact sheets are produced:
  contact-sheet-checker.png  — checkerboard background, so transparent
                               pixels are unambiguous.
  contact-sheet-magenta.png  — flat magenta background, the
                               quickest-to-eyeball test for stray
                               leftover tan / fringe pixels.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SRC = Path("/Users/matthewhall/dev/highland-games-tracker/Images for Cards")
OUT_PRIMARY = SRC / "cutouts"
OUT_COMPARE = OUT_PRIMARY / "_compare-u2net"

FILES = [
    "crest-stone.png",
    "crest-weight-for-distance.png",
    "crest-weight-over-bar.png",
    "crest-caber.png",
    "crest-hammer.png",
    "crest-sheaf.png",
]

CELL_W, CELL_H = 360, 480   # per-icon tile size
PAD = 20
HEADER = 40


def checker(size, square=20):
    w, h = size
    img = Image.new("RGB", size, (220, 220, 220))
    drw = ImageDraw.Draw(img)
    for y in range(0, h, square):
        for x in range(0, w, square):
            if ((x // square) + (y // square)) % 2 == 0:
                drw.rectangle([x, y, x + square, y + square], fill=(170, 170, 170))
    return img


def fit(img, box):
    bw, bh = box
    iw, ih = img.size
    scale = min(bw / iw, bh / ih)
    return img.resize((max(1, int(iw * scale)), max(1, int(ih * scale))), Image.LANCZOS)


def composite_onto(bg_factory, transparent_img, box):
    bg = bg_factory(box)
    fitted = fit(transparent_img, box)
    ox = (box[0] - fitted.size[0]) // 2
    oy = (box[1] - fitted.size[1]) // 2
    bg.paste(fitted, (ox, oy), fitted)
    return bg


def build(bg_factory, out_path, title):
    cols = 3   # source | isnet | u2net
    rows = len(FILES)
    W = PAD + cols * (CELL_W + PAD)
    H = HEADER + PAD + rows * (CELL_H + PAD + 20)
    sheet = Image.new("RGB", (W, H), (40, 40, 40))
    drw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        font_big = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    except OSError:
        font = ImageFont.load_default()
        font_big = font

    drw.text((PAD, 10), title, fill=(255, 255, 255), font=font_big)
    headers = ["source (tan bg)", "isnet-general-use (primary)", "u2net (compare)"]
    for c, h in enumerate(headers):
        x = PAD + c * (CELL_W + PAD)
        drw.text((x, HEADER), h, fill=(255, 255, 255), font=font)

    for r, name in enumerate(FILES):
        y = HEADER + PAD + r * (CELL_H + PAD + 20)
        drw.text((PAD, y - 18), name, fill=(255, 255, 255), font=font)

        src_img = Image.open(SRC / name).convert("RGBA")
        iso_img = Image.open(OUT_PRIMARY / name).convert("RGBA")
        u2_img = Image.open(OUT_COMPARE / name).convert("RGBA")

        for c, img in enumerate([src_img, iso_img, u2_img]):
            x = PAD + c * (CELL_W + PAD)
            tile = composite_onto(bg_factory, img, (CELL_W, CELL_H))
            sheet.paste(tile, (x, y))

    sheet.save(out_path)
    print(f"wrote {out_path}")


def main():
    build(
        lambda box: checker(box),
        OUT_PRIMARY / "contact-sheet-checker.png",
        "Crest cutouts — checkerboard bg (transparent pixels show through)",
    )
    build(
        lambda box: Image.new("RGB", box, (255, 0, 220)),
        OUT_PRIMARY / "contact-sheet-magenta.png",
        "Crest cutouts — magenta bg (any leftover tan / fringe screams)",
    )


if __name__ == "__main__":
    main()
