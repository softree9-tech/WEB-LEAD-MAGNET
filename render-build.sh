#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browser ONLY (allowed)
playwright install chromium
