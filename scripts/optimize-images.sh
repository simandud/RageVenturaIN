#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# RAGE VENTURE - Image Optimization Script
# Optimizes all images in the assets folder
# ═══════════════════════════════════════════════════════════════════

set -e

ASSETS_DIR="../public/assets"
OPTIMIZED_DIR="../public/assets/optimized"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  RAGE VENTURE Image Optimizer         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if required tools are installed
command -v convert >/dev/null 2>&1 || {
    echo -e "${RED}Error: ImageMagick not installed.${NC}"
    echo "Install with: sudo apt-get install imagemagick (Linux)"
    echo "or: brew install imagemagick (macOS)"
    exit 1
}

# Create optimized directory if it doesn't exist
mkdir -p "$OPTIMIZED_DIR"

echo -e "${YELLOW}Starting image optimization...${NC}"
echo ""

# Function to optimize PNG files
optimize_png() {
    local input=$1
    local filename=$(basename "$input" .png)
    local output_webp="${OPTIMIZED_DIR}/${filename}.webp"
    local output_png="${OPTIMIZED_DIR}/${filename}.png"

    echo -e "${GREEN}Processing:${NC} $filename.png"

    # Create WebP version (best compression)
    convert "$input" -quality 85 -define webp:lossless=false "$output_webp"

    # Create optimized PNG
    convert "$input" -strip -quality 85 -resize "1200x1200>" "$output_png"

    # Get file sizes
    original_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input")
    webp_size=$(stat -f%z "$output_webp" 2>/dev/null || stat -c%s "$output_webp")
    png_size=$(stat -f%z "$output_png" 2>/dev/null || stat -c%s "$output_png")

    # Calculate savings
    webp_savings=$(echo "scale=1; 100 - ($webp_size * 100 / $original_size)" | bc)
    png_savings=$(echo "scale=1; 100 - ($png_size * 100 / $original_size)" | bc)

    echo "  Original:    $(numfmt --to=iec-i --suffix=B $original_size)"
    echo "  WebP:        $(numfmt --to=iec-i --suffix=B $webp_size) (${webp_savings}% smaller)"
    echo "  Optimized:   $(numfmt --to=iec-i --suffix=B $png_size) (${png_savings}% smaller)"
    echo ""
}

# Function to optimize JPG files
optimize_jpg() {
    local input=$1
    local filename=$(basename "$input" .jpg)
    local output_webp="${OPTIMIZED_DIR}/${filename}.webp"
    local output_jpg="${OPTIMIZED_DIR}/${filename}.jpg"

    echo -e "${GREEN}Processing:${NC} $filename.jpg"

    # Create WebP version
    convert "$input" -quality 85 "$output_webp"

    # Create optimized JPG
    convert "$input" -strip -quality 85 -resize "1920x1920>" "$output_jpg"

    # Get file sizes
    original_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input")
    webp_size=$(stat -f%z "$output_webp" 2>/dev/null || stat -c%s "$output_webp")
    jpg_size=$(stat -f%z "$output_jpg" 2>/dev/null || stat -c%s "$output_jpg")

    # Calculate savings
    webp_savings=$(echo "scale=1; 100 - ($webp_size * 100 / $original_size)" | bc)
    jpg_savings=$(echo "scale=1; 100 - ($jpg_size * 100 / $original_size)" | bc)

    echo "  Original:    $(numfmt --to=iec-i --suffix=B $original_size)"
    echo "  WebP:        $(numfmt --to=iec-i --suffix=B $webp_size) (${webp_savings}% smaller)"
    echo "  Optimized:   $(numfmt --to=iec-i --suffix=B $jpg_size) (${jpg_savings}% smaller)"
    echo ""
}

# Optimize all PNG files
for file in "$ASSETS_DIR"/*.png; do
    if [ -f "$file" ]; then
        optimize_png "$file"
    fi
done

# Optimize all JPG files
for file in "$ASSETS_DIR"/*.jpg; do
    if [ -f "$file" ]; then
        optimize_jpg "$file"
    fi
done

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Optimization complete!${NC}"
echo -e "${GREEN}Optimized images saved to: ${OPTIMIZED_DIR}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review optimized images in ${OPTIMIZED_DIR}"
echo "2. Update HTML to use <picture> tags with WebP"
echo "3. Replace original images with optimized versions"
echo "4. Test website performance with Lighthouse"
