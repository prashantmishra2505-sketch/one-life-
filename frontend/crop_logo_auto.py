from PIL import Image, ImageDraw

img_path = 'c:/Users/anish/OneDrive/Desktop/one-life-/frontend/public/images/logo.png'
out_path = 'c:/Users/anish/OneDrive/Desktop/one-life-/frontend/public/images/vanlife-logo.png'

img = Image.open(img_path).convert('RGBA')

# Convert to grayscale to find dark pixels
gray = img.convert('L')
pixels = gray.load()

width, height = gray.size

# The emblem is on the left half, so only search x < width/2
min_x = width
max_x = 0
min_y = height
max_y = 0

# Threshold for "dark" vs "cream paper". Cream is usually > 220. Let's use 200.
for x in range(width // 2):
    for y in range(height):
        # Check if dark
        if pixels[x, y] < 200:
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

# Calculate bounding box
box_w = max_x - min_x
box_h = max_y - min_y

# Enforce square
size = max(box_w, box_h)
center_x = min_x + box_w // 2
center_y = min_y + box_h // 2

# Final coordinates
left = center_x - size // 2
top = center_y - size // 2
right = left + size
bottom = top + size

# To completely avoid the white crescent artifact, we shrink the radius slightly by 4 pixels to cut completely inside the green circle
shrink = 4
left += shrink
top += shrink
right -= shrink
bottom -= shrink
size -= 2 * shrink

emblem = img.crop((left, top, right, bottom))

# Create circular mask
mask = Image.new('L', (size, size), 0)
draw = ImageDraw.Draw(mask)
# Use a highly exact circle
draw.ellipse((0, 0, size, size), fill=255)

result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
result.paste(emblem, (0, 0), mask)

result.save(out_path)
print("Auto-cropped bounding box:", left, top, right, bottom)
