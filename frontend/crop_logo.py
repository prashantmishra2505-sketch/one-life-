from PIL import Image, ImageDraw

img_path = 'c:/Users/anish/OneDrive/Desktop/one-life-/frontend/public/images/logo.png'
out_path = 'c:/Users/anish/OneDrive/Desktop/one-life-/frontend/public/images/vanlife-logo.png'

img = Image.open(img_path).convert('RGBA')
w, h = img.size

# The emblem is on the left. We assume it's roughly a square of size h x h.
size = h
emblem = img.crop((0, 0, size, size))

# Create a circular mask to make corners transparent and remove surrounding texture
mask = Image.new('L', (size, size), 0)
draw = ImageDraw.Draw(mask)
# A circle that touches the edges of the square
draw.ellipse((0, 0, size, size), fill=255)

# Create a transparent image and paste using the mask
result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
result.paste(emblem, (0, 0), mask)

result.save(out_path)
print("Logo cropped and saved successfully.")
