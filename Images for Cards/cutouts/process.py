"""Batch background removal for the six crest icons.

Runs each source through two rembg models and lets us pick the best per
icon. Primary outputs (isnet-general-use) land in cutouts/, the u2net
comparison set lands in cutouts/_compare-u2net/. Outputs are full-res
RGBA PNGs, same filename as the source.
"""
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

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


def process_one(filename, session, out_dir):
    in_path = SRC / filename
    out_path = out_dir / filename
    with open(in_path, "rb") as f:
        data = f.read()
    result = remove(data, session=session)
    with open(out_path, "wb") as f:
        f.write(result)

    img = Image.open(out_path)
    assert img.mode == "RGBA", f"{filename}: not RGBA, got {img.mode}"
    alpha = img.split()[-1]
    a_min, a_max = alpha.getextrema()

    # Pixel-level alpha breakdown: how many fully-transparent, fully-opaque,
    # and partial (which is where halo/fringe lives).
    hist = alpha.histogram()
    total = sum(hist)
    fully_transparent = hist[0]
    fully_opaque = hist[255]
    partial = total - fully_transparent - fully_opaque
    return {
        "filename": filename,
        "size": img.size,
        "alpha_min": a_min,
        "alpha_max": a_max,
        "pct_transparent": 100.0 * fully_transparent / total,
        "pct_opaque": 100.0 * fully_opaque / total,
        "pct_partial": 100.0 * partial / total,
    }


def fmt_row(label, info):
    return (
        f"  {label:>22}  {info['size'][0]}x{info['size'][1]}  "
        f"alpha {info['alpha_min']:>3}-{info['alpha_max']:>3}  "
        f"transparent {info['pct_transparent']:5.1f}%  "
        f"opaque {info['pct_opaque']:5.1f}%  "
        f"partial {info['pct_partial']:5.2f}%"
    )


def main():
    OUT_PRIMARY.mkdir(parents=True, exist_ok=True)
    OUT_COMPARE.mkdir(parents=True, exist_ok=True)

    print("=== Primary: isnet-general-use -> cutouts/ ===")
    sess = new_session("isnet-general-use")
    primary_stats = {}
    for f in FILES:
        info = process_one(f, sess, OUT_PRIMARY)
        primary_stats[f] = info
        print(fmt_row(f, info))

    print("\n=== Comparison: u2net -> cutouts/_compare-u2net/ ===")
    sess = new_session("u2net")
    compare_stats = {}
    for f in FILES:
        info = process_one(f, sess, OUT_COMPARE)
        compare_stats[f] = info
        print(fmt_row(f, info))

    print("\n=== Per-icon delta (primary - u2net) ===")
    print("  Higher transparent% in primary suggests it found more interior holes.")
    print("  Lower partial% in primary suggests it has crisper edges (less halo).")
    for f in FILES:
        p, c = primary_stats[f], compare_stats[f]
        d_trans = p["pct_transparent"] - c["pct_transparent"]
        d_part = p["pct_partial"] - c["pct_partial"]
        print(
            f"  {f:>30}  d_transparent {d_trans:+5.1f}%  d_partial {d_part:+5.2f}%"
        )


if __name__ == "__main__":
    main()
