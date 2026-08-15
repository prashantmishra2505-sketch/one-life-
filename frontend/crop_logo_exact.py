from PIL import Image, ImageDraw

img_path = 'c:/Users/anish/OneDrive/Desktop/one-life-/frontend/public/images/logo.png'
out_path = 'c:/Users/anish/OneDrive/Desktop/one-life-/frontend/public/images/vanlife-logo.png'

img = Image.open(img_path).convert('RGBA')
gray = img.convert('L')
pixels = gray.load()

w, h = gray.size
mid_y = h // 2

# Find left edge of circle
start_x = 0
for x in range(w // 2):
    if pixels[x, mid_y] < 200:
        start_x = x
        break

# Find right edge of circle
end_x = start_x
for x in range(start_x + 10, w):
    if pixels[x, mid_y] > 200:
        end_x = x
        break

diameter = end_x - start_x

print(f"Detected start_x: {start_x}, end_x: {end_x}, diameter: {diameter}")

# Assume the circle is perfectly round.
# We will use this exact bounding box. 
# We shrink by 2 pixels to aggressively remove the crescent artifact.
shrink = 2
start_x += shrink
end_x -= shrink
diameter -= 2 * shrink

# Find top by centering it vertically. The circle should be vertically centered.
# Or we can scan from top to bottom at mid_x
mid_x = start_x + diameter // 2

start_y = 0
for y in range(h // 2):
    if pixels[mid_x, y] < 200:
        start_y = y
        break

start_y += shrink

# Crop
box = (start_x, start_y, start_x + diameter, start_y + diameter)
emblem = img.crop(box)

mask = Image.new('L', (diameter, diameter), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, diameter, diameter), fill=255)

result = Image.new('RGBA', (diameter, diameter), (0, 0, 0, 0))
result.paste(emblem, (0, 0), mask)

result.save(out_path)
print("Saved cleanly cropped circle:", box)
