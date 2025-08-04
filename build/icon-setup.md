# Icon Setup Instructions

## Required Icon Files

Place the following icon files in the `build/` directory:

1. **icon.icns** - macOS icon (1024x1024)
2. **icon.ico** - Windows icon (256x256)
3. **icon.png** - Linux icon (512x512 or 1024x1024)

## How to Create Icons

### From a single PNG source (1024x1024):

#### macOS (.icns):
```bash
# Using iconutil (built into macOS)
mkdir icon.iconset
sips -z 16 16     source.png --out icon.iconset/icon_16x16.png
sips -z 32 32     source.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     source.png --out icon.iconset/icon_32x32.png
sips -z 64 64     source.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   source.png --out icon.iconset/icon_128x128.png
sips -z 256 256   source.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   source.png --out icon.iconset/icon_256x256.png
sips -z 512 512   source.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   source.png --out icon.iconset/icon_512x512.png
cp source.png icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
rm -rf icon.iconset
```

#### Windows (.ico):
Use an online converter or tools like:
- https://convertio.co/png-ico/
- ImageMagick: `convert source.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`

#### Linux (.png):
Simply copy your 1024x1024 PNG:
```bash
cp source.png icon.png
```