#!/bin/bash
set -e

IMAGE_DIR="/var/lib/docker-images"

if [ ! -d "$IMAGE_DIR" ] || [ -z "$(ls -A "$IMAGE_DIR" 2>/dev/null)" ]; then
  echo "No images to load"
  exit 0
fi

for tarfile in "$IMAGE_DIR"/*.tar; do
  if [ -f "$tarfile" ]; then
    echo "Loading $tarfile..."
    docker load < "$tarfile"
  fi
done

# Clean up after loading
rm -rf "$IMAGE_DIR"
systemctl disable raspbocrate-load-images.service
