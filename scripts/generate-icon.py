"""Generate build/icon.ico from V1's brand identity.

Renders the same visual signature as Quarterline V1's favicon:
dark slate rounded square, gold trend line cresting up-right, three
bars (white, teal, white), and a gold-ringed dot anchoring the
trend. Saves a multi-resolution ICO with sizes 16, 24, 32, 48, 64,
128, 256.

Run: python scripts/generate-icon.py
"""

from PIL import Image, ImageDraw
from pathlib import Path
import math

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "build" / "icon.ico"

# V1 palette
BG = (16, 29, 37, 255)        # #101D25 slate
GOLD = (214, 162, 55, 255)    # #D6A237
WHITE = (234, 242, 239, 255)  # #EAF2EF
TEAL = (127, 170, 162, 255)   # #7FAAA2

SIZES = [16, 24, 32, 48, 64, 128, 256]


def lerp(a, b, t):
    return a + (b - a) * t


def render(size: int) -> Image.Image:
    """Render the icon at the given square size."""
    # Render at 4x then downsample for smoother edges
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded square background
    radius = max(int(s * 0.22), 1)
    draw.rounded_rectangle((0, 0, s - 1, s - 1), radius=radius, fill=BG)

    # Margin inside the rounded square
    pad = int(s * 0.18)
    inner = (pad, pad, s - pad, s - pad)

    # Three bars (white, teal, white) anchored to the bottom
    bars = [
        # (x_frac, height_frac, color)
        (0.10, 0.36, WHITE),
        (0.36, 0.62, TEAL),
        (0.62, 0.50, WHITE),
    ]
    bar_w = int(s * 0.16)
    base_y = inner[3]
    stroke = max(int(s * 0.045), 2)
    for x_frac, h_frac, color in bars:
        x = inner[0] + int((inner[2] - inner[0]) * x_frac)
        h = int((inner[3] - inner[1]) * h_frac)
        # Open-top rectangle stroke (left, top, right) — bar outline only
        x0, x1 = x, x + bar_w
        y0 = base_y - h
        y1 = base_y
        # left
        draw.line([(x0, y1), (x0, y0)], fill=color, width=stroke)
        # top
        draw.line([(x0, y0), (x1, y0)], fill=color, width=stroke)
        # right
        draw.line([(x1, y0), (x1, y1)], fill=color, width=stroke)

    # Gold trend line — gentle arc up to the right
    trend_w = max(int(s * 0.06), 3)
    points = []
    n = 28
    for i in range(n + 1):
        t = i / n
        # parametric arc rising from lower-left to upper-right
        x = inner[0] + (inner[2] - inner[0]) * lerp(0.06, 0.92, t)
        # ease curve: quick rise early, gentle late
        y_curve = 1 - (math.sin(t * math.pi / 2)) ** 1.5
        y = inner[1] + (inner[3] - inner[1]) * lerp(0.95, 0.10, 1 - y_curve)
        points.append((x, y))
    draw.line(points, fill=GOLD, width=trend_w, joint="curve")

    # Gold-ringed accent dot near the middle of the trend
    dot_t = 0.5
    dot_x = inner[0] + (inner[2] - inner[0]) * lerp(0.06, 0.92, dot_t)
    y_curve = 1 - (math.sin(dot_t * math.pi / 2)) ** 1.5
    dot_y = inner[1] + (inner[3] - inner[1]) * lerp(0.95, 0.10, 1 - y_curve)
    r = max(int(s * 0.07), 4)
    rg = max(int(s * 0.025), 2)
    draw.ellipse(
        (dot_x - r, dot_y - r, dot_x + r, dot_y + r),
        fill=BG,
        outline=GOLD,
        width=rg,
    )

    # Downsample for anti-aliasing
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    images = [render(sz) for sz in SIZES]
    base = images[-1]
    base.save(
        OUT,
        format="ICO",
        sizes=[(sz, sz) for sz in SIZES],
        append_images=[img for img in images[:-1]],
    )
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
