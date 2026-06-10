"""
Generate scuba and aviation theme hero background images (1600x900 JPG)
matching the flat-vector gradient style of mountain-adventure-hero.jpg:
a vertical gradient sky/water + a soft radial glow + layered flat
silhouette "peaks" along the bottom edge.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 900


def lerp(a, b, t):
    return a + (b - a) * t


def vertical_gradient(stops):
    """stops: list of (position 0-1, (r,g,b)) sorted by position."""
    arr = np.zeros((H, W, 3), dtype=np.float32)
    ys = np.linspace(0, 1, H)
    for y_idx, t in enumerate(ys):
        # find segment
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                seg_t = (t - p0) / (p1 - p0) if p1 > p0 else 0
                color = tuple(lerp(c0[k], c1[k], seg_t) for k in range(3))
                arr[y_idx, :, :] = color
                break
    return arr


def add_radial_glow(arr, cx, cy, radius, color, max_alpha):
    """cx, cy in [0,1] relative coords. radius in pixels."""
    yy, xx = np.mgrid[0:H, 0:W]
    cx_px, cy_px = cx * W, cy * H
    dist = np.sqrt((xx - cx_px) ** 2 + (yy - cy_px) ** 2)
    alpha = np.clip(1 - dist / radius, 0, 1) * max_alpha
    for k in range(3):
        arr[:, :, k] = arr[:, :, k] * (1 - alpha) + color[k] * alpha
    return arr


def add_silhouette(arr, points_list, color):
    """points_list: list of (x,y) in pixel coords forming a closed polygon (bottom edge included)."""
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(points_list, fill=255)
    mask_arr = np.array(mask, dtype=np.float32) / 255.0
    for k in range(3):
        arr[:, :, k] = arr[:, :, k] * (1 - mask_arr) + color[k] * mask_arr
    return arr


def add_circles(arr, circles, color, alpha=0.35):
    img = Image.fromarray(arr.astype(np.uint8))
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for (cx, cy, r) in circles:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (int(255 * alpha),))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay)
    return np.array(img.convert("RGB"), dtype=np.float32)


# ── Aviation: looking down from a plane at sunset, rolling cloud banks ──────
aviation = vertical_gradient([
    (0.0, (10, 26, 48)),     # deep navy sky
    (0.45, (30, 77, 120)),   # mid blue
    (1.0, (169, 212, 236)),  # pale horizon blue
])
aviation = add_radial_glow(aviation, cx=0.5, cy=0.66, radius=750, color=(255, 176, 102), max_alpha=0.45)


def cloud_band(base_y, amp1, amp2, freq1, freq2, phase):
    xs = np.linspace(0, W, 200)
    ys = base_y - amp1 * np.sin(xs / W * np.pi * freq1 + phase) - amp2 * np.sin(xs / W * np.pi * freq2 + phase * 1.7)
    pts = [(0, H)] + list(zip(xs, ys)) + [(W, H)]
    return pts


# Far cloud band (lighter, gentle rolling)
aviation = add_silhouette(aviation, cloud_band(600, 40, 20, 3, 7, 0.5), (196, 220, 236))

# Near cloud band (darker silhouette, bigger rolling puffs)
aviation = add_silhouette(aviation, cloud_band(660, 70, 30, 2.4, 5.5, 1.6), (22, 36, 47))

Image.fromarray(np.clip(aviation, 0, 255).astype(np.uint8)).save("aviation-hero.jpg", "JPEG", quality=90)


# ── Scuba: underwater, sunlight from above, reef silhouette below ───────────
scuba = vertical_gradient([
    (0.0, (191, 233, 232)),  # bright surface
    (0.35, (31, 111, 134)),  # mid water
    (1.0, (8, 34, 46)),      # deep water
])
scuba = add_radial_glow(scuba, cx=0.5, cy=0.0, radius=1000, color=(234, 255, 247), max_alpha=0.5)

# Far reef silhouette
far_curve_x = np.linspace(0, W, 9)
far_curve_y = [640, 560, 615, 520, 600, 540, 610, 560, 600]
far_pts = [(0, H)] + list(zip(far_curve_x, far_curve_y)) + [(W, H)]
scuba = add_silhouette(scuba, far_pts, (47, 127, 140))

# Near reef silhouette (darker, taller)
near_curve_x = np.linspace(0, W, 9)
near_curve_y = [680, 560, 660, 540, 650, 560, 660, 570, 650]
near_pts = [(0, H)] + list(zip(near_curve_x, near_curve_y)) + [(W, H)]
scuba = add_silhouette(scuba, near_pts, (12, 37, 48))

# Bubbles
scuba = add_circles(scuba, [
    (420, 320, 6), (440, 260, 4), (980, 220, 7),
    (1000, 160, 4), (1200, 380, 5), (700, 180, 3),
], color=(234, 255, 247), alpha=0.35)

Image.fromarray(np.clip(scuba, 0, 255).astype(np.uint8)).save("scuba-hero.jpg", "JPEG", quality=90)

print("done")
