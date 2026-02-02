#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Install regular npm dependencies
npm install

# 2. Set the Cache Directory variable for the installer
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer

# 3. Create the directory if it doesn't exist (safety first!)
mkdir -p $PUPPETEER_CACHE_DIR

# 4. Install Chrome into that directory
npx puppeteer browsers install chrome