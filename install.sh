#!/bin/bash

set -e  # Exit on error

EXTENSION_UUID="pomodoro-timer@vladvorobei"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
CURRENT_DIR=$(pwd)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🍅 Pomodoro Timer Extension Installer${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "extension.js" ] || [ ! -f "metadata.json" ]; then
    echo -e "${RED}❌ Error: Required files not found!${NC}"
    echo "   Please run this script from the extension root directory."
    exit 1
fi

# Backup existing installation
if [ -d "$EXTENSION_DIR" ]; then
    echo -e "${YELLOW}📦 Backing up existing installation...${NC}"
    rm -rf "$EXTENSION_DIR.backup"
    mv "$EXTENSION_DIR" "$EXTENSION_DIR.backup"
fi

# Install
echo -e "${GREEN}📂 Installing to $EXTENSION_DIR...${NC}"
mkdir -p "$EXTENSION_DIR"
cp -r extension.js metadata.json stylesheet.css src/ "$EXTENSION_DIR/"

# Copy icons if they exist
if [ -d "icons" ]; then
    cp -r icons/ "$EXTENSION_DIR/"
fi

echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Enable: gnome-extensions enable $EXTENSION_UUID"
echo "  2. Restart GNOME Shell:"
echo "     - X11: Press Alt+F2, type 'r', press Enter"
echo "     - Wayland: Log out and log back in"