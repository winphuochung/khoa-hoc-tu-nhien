import os
from PIL import Image

# Read root logo.png
im = Image.open('logo.png')
bbox = im.getbbox()
pad = 6
w, h = im.size
crop_box = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(w, bbox[2]+pad), min(h, bbox[3]+pad))
cropped = im.crop(crop_box)

os.makedirs('public', exist_ok=True)
os.makedirs('dist', exist_ok=True)
os.makedirs('src/assets', exist_ok=True)

# Save cropped logo in all destinations
cropped.save('public/logo.png', optimize=True)
cropped.save('dist/logo.png', optimize=True)
cropped.save('src/assets/logo.png', optimize=True)

print(f'Cropped logo from {im.size} to {cropped.size} and saved to public/, dist/, src/assets/')
