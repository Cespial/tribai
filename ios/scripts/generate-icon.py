#!/usr/bin/env python3
"""
TribAI App Icon Generator
Generates a 1024x1024 PNG icon with the TribAI constellation brand mark.

Brand: Triangle constellation with connected nodes on navy background.
- Navy background: #0A1628
- Gold accent: #C4952A
- Light blue accent: #3B82B8
- White nodes at vertices
"""

import math
import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageFilter

# --- Configuration ---
SIZE = 1024
CENTER = SIZE // 2

# Colors
NAVY = (10, 22, 40)          # #0A1628
NAVY_LIGHTER = (18, 35, 60)  # slightly lighter for gradient center
GOLD = (196, 149, 42)        # #C4952A
GOLD_GLOW = (196, 149, 42, 60)
LIGHT_BLUE = (59, 130, 184)  # #3B82B8
WHITE = (255, 255, 255)
LINE_COLOR = (180, 210, 240, 70)       # semi-transparent light blue lines
LINE_COLOR_BRIGHT = (180, 210, 240, 100)  # slightly brighter for main triangle

# Triangle vertices (equilateral-ish, centered, shifted up to leave room for text)
TOP = (512, 195)
BOTTOM_LEFT = (195, 740)
BOTTOM_RIGHT = (829, 740)

# Internal points
MID_CENTER = (512, 558)
MID_LEFT = (354, 468)
MID_RIGHT = (670, 468)

# Additional subtle constellation points (smaller, decorative)
EXTRA_POINTS = [
    (433, 330),   # between top and mid_left
    (591, 330),   # between top and mid_right
    (274, 605),   # between bottom_left and mid_left
    (750, 605),   # between bottom_right and mid_right
    (354, 740),   # along bottom edge
    (670, 740),   # along bottom edge
]

# Node sizes
VERTEX_RADIUS = 18
MID_RADIUS = 12
CENTER_RADIUS = 36
EXTRA_RADIUS = 6


def create_radial_gradient(size, center_color, edge_color):
    """Create a radial gradient background image."""
    img = Image.new("RGB", (size, size), edge_color)
    draw = ImageDraw.Draw(img)

    max_radius = int(math.sqrt(2) * size / 2)
    cx, cy = size // 2, size // 2

    for r in range(max_radius, 0, -1):
        t = r / max_radius
        # Ease-out curve for smoother gradient
        t = t * t
        color = tuple(
            int(center_color[i] + (edge_color[i] - center_color[i]) * t)
            for i in range(3)
        )
        bbox = (cx - r, cy - r, cx + r, cy + r)
        draw.ellipse(bbox, fill=color)

    return img


def draw_glow(draw, center, radius, color, layers=8):
    """Draw a soft glow effect around a point."""
    for i in range(layers, 0, -1):
        r = radius + i * 6
        alpha = max(5, int(color[3] * (1 - i / layers) ** 2)) if len(color) == 4 else 20
        glow_color = (*color[:3], alpha)
        bbox = (center[0] - r, center[1] - r, center[0] + r, center[1] + r)
        draw.ellipse(bbox, fill=glow_color)


def draw_node(draw, center, radius, color, glow=False, glow_color=None):
    """Draw a circular node with optional glow."""
    if glow and glow_color:
        draw_glow(draw, center, radius, glow_color, layers=10)

    # Main circle
    bbox = (center[0] - radius, center[1] - radius,
            center[0] + radius, center[1] + radius)
    draw.ellipse(bbox, fill=color)

    # Inner highlight (subtle bright spot)
    highlight_r = max(3, radius // 3)
    offset = max(1, radius // 6)
    hx, hy = center[0] - offset, center[1] - offset
    h_bbox = (hx - highlight_r, hy - highlight_r, hx + highlight_r, hy + highlight_r)
    highlight_color = tuple(min(255, c + 60) for c in color[:3])
    if len(highlight_color) == 3:
        highlight_color = (*highlight_color, 120)
    draw.ellipse(h_bbox, fill=highlight_color)


def draw_line(draw, start, end, color, width=2):
    """Draw a line between two points."""
    draw.line([start, end], fill=color, width=width)


def generate_icon():
    """Generate the TribAI app icon."""

    # 1. Create background with radial gradient
    bg = create_radial_gradient(SIZE, NAVY_LIGHTER, NAVY)

    # Create RGBA overlay for transparency effects
    overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    # 2. Add very subtle background star dots (tiny constellation feel)
    import random
    random.seed(42)  # deterministic
    for _ in range(60):
        x = random.randint(40, SIZE - 40)
        y = random.randint(40, SIZE - 40)
        # Skip dots that would overlap with main constellation area
        if 150 < x < 870 and 150 < y < 800:
            continue
        alpha = random.randint(15, 50)
        r = random.randint(1, 3)
        overlay_draw.ellipse((x - r, y - r, x + r, y + r), fill=(200, 220, 240, alpha))

    # 3. Draw connecting lines (constellation edges)
    # Main triangle edges
    for start, end in [(TOP, BOTTOM_LEFT), (TOP, BOTTOM_RIGHT), (BOTTOM_LEFT, BOTTOM_RIGHT)]:
        draw_line(overlay_draw, start, end, LINE_COLOR_BRIGHT, width=2)

    # Lines from center to vertices
    for vertex in [TOP, BOTTOM_LEFT, BOTTOM_RIGHT]:
        draw_line(overlay_draw, MID_CENTER, vertex, LINE_COLOR, width=2)

    # Lines from center to mid-points
    for mid in [MID_LEFT, MID_RIGHT]:
        draw_line(overlay_draw, MID_CENTER, mid, LINE_COLOR, width=2)

    # Lines from mid-points to adjacent vertices
    draw_line(overlay_draw, MID_LEFT, TOP, LINE_COLOR, width=1)
    draw_line(overlay_draw, MID_RIGHT, TOP, LINE_COLOR, width=1)
    draw_line(overlay_draw, MID_LEFT, BOTTOM_LEFT, LINE_COLOR, width=1)
    draw_line(overlay_draw, MID_RIGHT, BOTTOM_RIGHT, LINE_COLOR, width=1)

    # Lines between mid-points
    draw_line(overlay_draw, MID_LEFT, MID_RIGHT, LINE_COLOR, width=1)

    # Extra decorative lines
    draw_line(overlay_draw, EXTRA_POINTS[0], MID_LEFT, (180, 210, 240, 40), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[1], MID_RIGHT, (180, 210, 240, 40), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[0], TOP, (180, 210, 240, 40), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[1], TOP, (180, 210, 240, 40), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[2], BOTTOM_LEFT, (180, 210, 240, 40), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[3], BOTTOM_RIGHT, (180, 210, 240, 40), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[4], BOTTOM_LEFT, (180, 210, 240, 30), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[5], BOTTOM_RIGHT, (180, 210, 240, 30), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[4], MID_CENTER, (180, 210, 240, 30), width=1)
    draw_line(overlay_draw, EXTRA_POINTS[5], MID_CENTER, (180, 210, 240, 30), width=1)

    # 4. Draw glow effects first (behind nodes)
    # Gold glow for center node
    draw_glow(overlay_draw, MID_CENTER, CENTER_RADIUS, (196, 149, 42, 50), layers=12)

    # Subtle white glow for vertices
    for vertex in [TOP, BOTTOM_LEFT, BOTTOM_RIGHT]:
        draw_glow(overlay_draw, vertex, VERTEX_RADIUS, (200, 220, 255, 30), layers=6)

    # 5. Draw extra decorative nodes (smallest, behind main nodes)
    for pt in EXTRA_POINTS:
        draw_node(overlay_draw, pt, EXTRA_RADIUS, (160, 190, 220, 140))

    # 6. Draw mid-point nodes (light blue)
    for mid in [MID_LEFT, MID_RIGHT]:
        draw_node(overlay_draw, mid, MID_RADIUS, (*LIGHT_BLUE, 255))

    # 7. Draw vertex nodes (white)
    for vertex in [TOP, BOTTOM_LEFT, BOTTOM_RIGHT]:
        draw_node(overlay_draw, vertex, VERTEX_RADIUS, (*WHITE, 255))

    # 8. Draw center gold node (largest, with glow)
    draw_node(overlay_draw, MID_CENTER, CENTER_RADIUS, (*GOLD, 255),
              glow=True, glow_color=(196, 149, 42, 45))

    # 9. Add "TribAI" text below the triangle
    text = "TribAI"

    # Try to find a good system font
    font = None
    font_size = 110
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/Library/Fonts/SF-Pro-Display-Medium.otf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
    ]

    for fp in font_paths:
        try:
            font = ImageFont.truetype(fp, font_size)
            break
        except (OSError, IOError):
            continue

    if font is None:
        font = ImageFont.load_default()

    # Measure text
    text_bbox = overlay_draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    text_x = (SIZE - text_width) // 2
    text_y = 840

    # Draw text with subtle glow
    glow_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 40))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=8))
    overlay = Image.alpha_composite(overlay, glow_layer)

    # Re-create draw on the composited overlay
    overlay_draw = ImageDraw.Draw(overlay)

    # Draw main text with letter spacing
    letter_spacing = 12
    total_spaced_width = 0
    char_widths = []
    for ch in text:
        cb = overlay_draw.textbbox((0, 0), ch, font=font)
        w = cb[2] - cb[0]
        char_widths.append(w)
        total_spaced_width += w
    total_spaced_width += letter_spacing * (len(text) - 1)

    cursor_x = (SIZE - total_spaced_width) // 2
    for i, ch in enumerate(text):
        overlay_draw.text((cursor_x, text_y), ch, font=font, fill=(255, 255, 255, 230))
        cursor_x += char_widths[i] + letter_spacing

    # 10. Composite overlay onto background
    bg_rgba = bg.convert("RGBA")
    result = Image.alpha_composite(bg_rgba, overlay)
    final = result.convert("RGB")

    return final


def main():
    print("Generating TribAI app icon (1024x1024)...")

    icon = generate_icon()

    # Determine output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    output_path = os.path.join(
        project_dir,
        "SuperAppTributaria", "Resources", "Assets.xcassets",
        "AppIcon.appiconset", "AppIcon.png"
    )

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save
    icon.save(output_path, "PNG", quality=100)

    # Verify
    verify = Image.open(output_path)
    print(f"Icon saved to: {output_path}")
    print(f"Dimensions: {verify.size[0]}x{verify.size[1]}")
    print(f"File size: {os.path.getsize(output_path):,} bytes")
    print("Done!")


if __name__ == "__main__":
    main()
