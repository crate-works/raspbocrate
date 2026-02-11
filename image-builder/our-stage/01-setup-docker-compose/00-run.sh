#!/bin/bash -ex

# add default user to docker group
on_chroot <<EOF
  adduser $FIRST_USER_NAME docker
EOF

# Install files to the image
install -d "${ROOTFS_DIR}/opt/raspbocrate"
install -m 644 files/docker-compose.yml "${ROOTFS_DIR}/opt/raspbocrate/docker-compose.yml"
install -m 644 files/nginx.conf "${ROOTFS_DIR}/opt/raspbocrate/nginx.conf"
install -m 644 files/oni-ui.json "${ROOTFS_DIR}/opt/raspbocrate/oni-ui.json"
install -m 644 files/logo.png "${ROOTFS_DIR}/opt/raspbocrate/logo.png"
install -m 644 files/raspbocrate.service "${ROOTFS_DIR}/etc/systemd/system/raspbocrate.service"

# Enable the service
on_chroot <<EOF
  systemctl enable raspbocrate.service
EOF

# Pre-pull Docker images using skopeo
mapfile -t IMAGES < <(grep '^\s*image:' files/docker-compose.yml | sed 's/.*image:\s*//')

install -d "${ROOTFS_DIR}/var/lib/docker-images"

# Download all images
for img in "${IMAGES[@]}"; do
  dirname=${img//[\/:]/__}
  echo "Pulling $img..."
  rm -rf "${ROOTFS_DIR}/var/lib/docker-images/${dirname}.tar"
  skopeo copy --override-arch arm64 --override-os linux "docker://$img" "docker-archive:${ROOTFS_DIR}/var/lib/docker-images/${dirname}.tar:${img}"
done

# Install first-boot script and service to load images
install -m 755 files/load-images.sh "${ROOTFS_DIR}/opt/raspbocrate/load-images.sh"
install -m 644 files/raspbocrate-load-images.service "${ROOTFS_DIR}/etc/systemd/system/raspbocrate-load-images.service"

on_chroot <<EOF
  systemctl enable raspbocrate-load-images.service
EOF
