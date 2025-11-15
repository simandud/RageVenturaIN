# Image Optimization Guide - RAGE VENTURE

## 🔴 CRITICAL: Image Optimization Required

Your current images are causing severe performance issues:

| Image | Current Size | Target Size | Reduction Needed |
|-------|--------------|-------------|------------------|
| `logorageve.png` | **13MB** | 150KB | **99%** |
| `logorageve_!.png` | **4MB** | 100KB | **97.5%** |
| `logorageve_!_HORIZONTAL.png` | **3.2MB** | 100KB | **97%** |
| `logo1.jpg` | **3.4MB** | 300KB | **91%** |

**Expected Impact:** Page load time improvement from **15-30s → 2-4s**

---

## Option 1: Automated Script (Recommended)

### Prerequisites

Install ImageMagick:

```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Windows (via Chocolatey)
choco install imagemagick
```

### Run Optimization Script

```bash
cd scripts
chmod +x optimize-images.sh
./optimize-images.sh
```

The script will:
- ✅ Create WebP versions (85% quality, best compression)
- ✅ Create optimized PNG/JPG versions
- ✅ Display file size savings
- ✅ Save to `public/assets/optimized/`

---

## Option 2: Online Tools (No Installation)

### Recommended Tools:

1. **Squoosh** (Google) - https://squoosh.app/
   - Drag and drop your images
   - Select WebP format
   - Quality: 85
   - Download optimized version

2. **TinyPNG** - https://tinypng.com/
   - Upload PNG images
   - Automatically compresses
   - Download optimized versions

3. **Compressor.io** - https://compressor.io/
   - Upload any image format
   - Choose lossy compression
   - Download result

### Process:

1. Upload `logorageve.png` to Squoosh
2. Settings:
   - Resize to max 1200px width
   - Format: WebP
   - Quality: 85
3. Download as `logorageve.webp`
4. Repeat for all logo images

---

## Option 3: Professional Tools

### Using Sharp (Node.js)

```bash
npm install -g sharp-cli
```

```bash
# Convert to WebP
sharp -i assets/logorageve.png -o assets/logorageve.webp --webp-quality 85

# Resize and optimize PNG
sharp -i assets/logorageve.png -o assets/logorageve-optimized.png \
  --resize 1200 --compression 9
```

---

## Implementation in HTML

After optimization, update your HTML to use modern `<picture>` element:

### Before (Current):
```html
<img src="assets/logorageve_!.png" alt="RAGE VENTURE" />
```

### After (Optimized):
```html
<picture>
  <!-- WebP for modern browsers -->
  <source srcset="assets/optimized/logorageve_!.webp" type="image/webp">

  <!-- Fallback PNG for older browsers -->
  <source srcset="assets/optimized/logorageve_!.png" type="image/png">

  <!-- Default fallback -->
  <img src="assets/optimized/logorageve_!.png"
       alt="RAGE VENTURE logo con signo de exclamación"
       loading="lazy"
       width="500"
       height="auto">
</picture>
```

### Responsive Images (Different Sizes):

```html
<picture>
  <!-- WebP versions for different screen sizes -->
  <source
    srcset="assets/optimized/logo-400.webp 400w,
            assets/optimized/logo-800.webp 800w,
            assets/optimized/logo-1200.webp 1200w"
    sizes="(max-width: 600px) 400px,
           (max-width: 1200px) 800px,
           1200px"
    type="image/webp">

  <!-- PNG fallback -->
  <source
    srcset="assets/optimized/logo-400.png 400w,
            assets/optimized/logo-800.png 800w,
            assets/optimized/logo-1200.png 1200w"
    sizes="(max-width: 600px) 400px,
           (max-width: 1200px) 800px,
           1200px"
    type="image/png">

  <img src="assets/optimized/logo-800.png"
       alt="RAGE VENTURE"
       loading="lazy">
</picture>
```

---

## Specific Image Guidelines

### Logo Images

**Target Specifications:**
- Format: WebP (primary), PNG (fallback)
- Max dimensions: 1200x1200px
- Quality: 85 (WebP), 90 (PNG)
- Target size: 50-150KB

**Optimization commands:**

```bash
# Hero logo (logorageve_!.png)
sharp -i logorageve_!.png -o logorageve_!.webp --webp-quality 85
sharp -i logorageve_!.png -o logorageve_!-optimized.png --resize 800 --compression 9

# Horizontal logo
sharp -i logorageve_!_HORIZONTAL.png -o logorageve_!_HORIZONTAL.webp --webp-quality 85
sharp -i logorageve_!_HORIZONTAL.png -o logorageve_!_HORIZONTAL-optimized.png --resize 1200 --compression 9
```

### Social Media Images (OG/Twitter Cards)

Create optimized versions for social sharing:

**OpenGraph Image (1200x630px):**
```bash
sharp -i logo1.jpg \
  -o og-image.jpg \
  --resize 1200 630 \
  --fit cover \
  --quality 85
```

**Twitter Card (1200x628px):**
```bash
sharp -i logo1.jpg \
  -o twitter-card.jpg \
  --resize 1200 628 \
  --fit cover \
  --quality 85
```

---

## Lazy Loading Implementation

Add `loading="lazy"` to all images except above-the-fold:

```html
<!-- Hero image - DON'T lazy load (above fold) -->
<img src="logo.webp" alt="Logo" loading="eager">

<!-- Below-fold images - LAZY LOAD -->
<img src="image1.webp" alt="Description" loading="lazy" decoding="async">
<img src="image2.webp" alt="Description" loading="lazy" decoding="async">
```

---

## Browser Support

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| WebP   | ✅ 23+ | ✅ 65+  | ✅ 14+ | ✅ 18+ |
| PNG    | ✅ All | ✅ All  | ✅ All | ✅ All |

**WebP support:** 95%+ of browsers (2023+)

For older browsers, the `<picture>` element automatically falls back to PNG.

---

## Testing Performance

### Before Optimization:
```bash
# Check current page size
curl -o /dev/null -s -w 'Total: %{size_download} bytes\nTime: %{time_total}s\n' https://rageventure.com/
```

### After Optimization:

1. **Lighthouse Audit:**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run Performance audit
   - Target score: 90+

2. **PageSpeed Insights:**
   - Visit: https://pagespeed.web.dev/
   - Enter: https://rageventure.com
   - Target: Green scores for mobile & desktop

3. **WebPageTest:**
   - Visit: https://www.webpagetest.org/
   - Test from multiple locations
   - Target: LCP < 2.5s

---

## Automation with GitHub Actions

Create `.github/workflows/optimize-images.yml`:

```yaml
name: Optimize Images

on:
  push:
    paths:
      - 'public/assets/**/*.png'
      - 'public/assets/**/*.jpg'

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install ImageMagick
        run: sudo apt-get install -y imagemagick

      - name: Optimize Images
        run: |
          cd scripts
          chmod +x optimize-images.sh
          ./optimize-images.sh

      - name: Commit optimized images
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/assets/optimized/
          git commit -m "Auto-optimize images" || exit 0
          git push
```

---

## Quick Checklist

- [ ] Run optimization script OR use online tools
- [ ] Verify file sizes are under targets
- [ ] Update HTML to use `<picture>` elements
- [ ] Add `loading="lazy"` to below-fold images
- [ ] Test on slow connection (Chrome DevTools → Network → Slow 3G)
- [ ] Run Lighthouse audit
- [ ] Verify images display correctly in all browsers
- [ ] Deploy to production

---

## Expected Results

### Before:
- Total page weight: ~25MB
- Load time: 15-30s (slow connection)
- Lighthouse Performance: 35/100

### After:
- Total page weight: ~1.8MB (93% reduction)
- Load time: 2-4s (slow connection)
- Lighthouse Performance: 90+/100

---

## Need Help?

If you encounter issues:

1. Check the generated files in `public/assets/optimized/`
2. Verify file sizes with: `ls -lh public/assets/optimized/`
3. Test image quality in browser
4. Adjust quality parameter if needed (70-90 range)

For further assistance, refer to:
- ImageMagick docs: https://imagemagick.org/
- WebP guide: https://developers.google.com/speed/webp
- Lighthouse docs: https://web.dev/lighthouse-performance/
