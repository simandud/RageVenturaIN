#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# RAGE VENTURE - Build Script
# Minifies CSS and JavaScript for production
# ═══════════════════════════════════════════════════════════════════

set -e

PUBLIC_DIR="../public"
DIST_DIR="../public/dist"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  RAGE VENTURE Build Process            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Create dist directory
mkdir -p "$DIST_DIR"

echo -e "${BLUE}[1/3] Minifying CSS...${NC}"

# Check if cleancss is installed
if ! command -v cleancss &> /dev/null; then
    echo -e "${YELLOW}Installing clean-css-cli...${NC}"
    npm install -g clean-css-cli
fi

# Combine and minify CSS
cleancss -o "${DIST_DIR}/styles.min.css" \
    "${PUBLIC_DIR}/styles.css" \
    "${PUBLIC_DIR}/animations.css" \
    "${PUBLIC_DIR}/paginas.css"

# Get file sizes
original_css_size=$(wc -c < "${PUBLIC_DIR}/styles.css")
original_css_size=$((original_css_size + $(wc -c < "${PUBLIC_DIR}/animations.css") + $(wc -c < "${PUBLIC_DIR}/paginas.css")))
minified_css_size=$(wc -c < "${DIST_DIR}/styles.min.css")
css_savings=$(echo "scale=1; 100 - ($minified_css_size * 100 / $original_css_size)" | bc)

echo "  Original:  $(numfmt --to=iec-i --suffix=B $original_css_size)"
echo "  Minified:  $(numfmt --to=iec-i --suffix=B $minified_css_size)"
echo -e "  ${GREEN}Saved: ${css_savings}%${NC}"
echo ""

echo -e "${BLUE}[2/3] Minifying JavaScript...${NC}"

# Check if terser is installed
if ! command -v terser &> /dev/null; then
    echo -e "${YELLOW}Installing terser...${NC}"
    npm install -g terser
fi

# Minify individual JS files
for js_file in "${PUBLIC_DIR}"/*.js; do
    if [ -f "$js_file" ]; then
        filename=$(basename "$js_file")
        minified_name="${filename%.js}.min.js"

        terser "$js_file" \
            -c \
            -m \
            --comments false \
            -o "${DIST_DIR}/${minified_name}"

        original_size=$(wc -c < "$js_file")
        minified_size=$(wc -c < "${DIST_DIR}/${minified_name}")
        savings=$(echo "scale=1; 100 - ($minified_size * 100 / $original_size)" | bc)

        echo "  ${filename}"
        echo "    Original:  $(numfmt --to=iec-i --suffix=B $original_size)"
        echo "    Minified:  $(numfmt --to=iec-i --suffix=B $minified_size)"
        echo -e "    ${GREEN}Saved: ${savings}%${NC}"
    fi
done
echo ""

echo -e "${BLUE}[3/3] Creating production bundle...${NC}"

# Combine critical JS files
terser "${PUBLIC_DIR}/animations.js" \
       "${PUBLIC_DIR}/script.js" \
       "${PUBLIC_DIR}/menu-toggle.js" \
       -c \
       -m \
       --comments false \
       -o "${DIST_DIR}/bundle.min.js"

bundle_size=$(wc -c < "${DIST_DIR}/bundle.min.js")
echo "  Bundle size: $(numfmt --to=iec-i --suffix=B $bundle_size)"
echo ""

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "${GREEN}Production files in: ${DIST_DIR}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update HTML to use minified files:"
echo "   <link rel='stylesheet' href='dist/styles.min.css'>"
echo "   <script src='dist/bundle.min.js'></script>"
echo "2. Test website functionality"
echo "3. Run Lighthouse audit"
echo "4. Deploy to production"
