"""Genererar Fyrtals ikonassets ur samma palett som appen."""
from PIL import Image, ImageDraw

PAPER = (247, 244, 238, 255)
INK = (28, 26, 23, 255)
LEVELS = [
    (227, 206, 150, 255),  # sand
    (169, 191, 162, 255),  # salvia
    (138, 164, 190, 255),  # dimbla
    (142, 119, 150, 255),  # plommon
]

SS = 4  # supersampling, PIL antialiasar inte former


def grid(size, extent, bg, colors, radius_ratio=0.28, gap_ratio=0.055):
    """2x2-rutnat centrerat pa en kvadratisk duk.

    `extent` = rutnatets bredd som andel av duken.
    """
    canvas = size * SS
    img = Image.new("RGBA", (canvas, canvas), bg)
    draw = ImageDraw.Draw(img)

    total = canvas * extent
    gap = total * gap_ratio
    tile = (total - gap) / 2
    radius = tile * radius_ratio
    left = (canvas - total) / 2
    top = (canvas - total) / 2

    for index, color in enumerate(colors):
        row, col = divmod(index, 2)
        x0 = left + col * (tile + gap)
        y0 = top + row * (tile + gap)
        draw.rounded_rectangle(
            [x0, y0, x0 + tile, y0 + tile], radius=radius, fill=color
        )

    return img.resize((size, size), Image.LANCZOS)


def save(img, path):
    img.save(path)
    print(f"{path}  {img.size[0]}x{img.size[1]}")


OUT = "/home/user/fyrtal/assets"

# Huvudikon: rutnatet pa papper, generost men inte trangt.
save(grid(1024, 0.66, PAPER, LEVELS), f"{OUT}/icon.png")

# Adaptiv ikon: innehallet maste rymmas i den inre sakerhetszonen (~66%),
# annars beskars det av systemets mask. Darav mindre extent.
save(grid(1024, 0.46, (0, 0, 0, 0), LEVELS), f"{OUT}/android-icon-foreground.png")
save(grid(1024, 0.0, PAPER, []), f"{OUT}/android-icon-background.png")

# Monokrom ikon: Android tematiserar via alfakanalen, formen ska vara solid.
save(grid(1024, 0.46, (0, 0, 0, 0), [INK] * 4), f"{OUT}/android-icon-monochrome.png")

# Splash: transparent, appen ritar bakgrunden.
save(grid(1024, 0.68, (0, 0, 0, 0), LEVELS), f"{OUT}/splash-icon.png")

save(grid(196, 0.68, PAPER, LEVELS), f"{OUT}/favicon.png")
