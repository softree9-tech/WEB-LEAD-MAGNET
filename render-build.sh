#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright Chromium browser WITH its system dependencies in one step
# This avoids needing root/sudo (which Render doesn't allow for apt-get)
playwright install --with-deps chromium
