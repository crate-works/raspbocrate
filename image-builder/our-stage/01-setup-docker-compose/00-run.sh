#!/bin/bash -e

# Install files to the image
install -d "${ROOTFS_DIR}/opt/raspocrate"
install -m 644 files/docker-compose.yml "${ROOTFS_DIR}/opt/raspocrate/docker-compose.yml"
install -m 644 files/oni-ui.json "${ROOTFS_DIR}/opt/raspocrate/oni-ui.json"
install -m 644 files/logo.png "${ROOTFS_DIR}/opt/raspocrate/logo.png"
install -m 644 files/raspocrate.service "${ROOTFS_DIR}/etc/systemd/system/raspocrate.service"

# Enable the service
on_chroot <<EOF
systemctl enable raspocrate.service
EOF

# Pre-pull Docker images using skopeo
# Images are stored in OCI format, with a manifest listing the original names
IMAGES=(
  "mysql:8"
  "opensearchproject/opensearch:3"
  "ghcr.io/language-research-technology/oni-ui:new-api"
  "ghcr.io/paradisec-archive/raspbocapi:main"
  "ghcr.io/paradisec-archive/raspbocrate:main"
)

install -d "${ROOTFS_DIR}/var/lib/docker-images"

# Create manifest file to track image names
touch "${ROOTFS_DIR}/var/lib/docker-images/manifest.txt"

for img in "${IMAGES[@]}"; do
  # Create a safe directory name (replace / and : with __)
  dirname=${img//[/:]/__/g}
  echo "Pulling $img..."
  skopeo copy --override-arch arm64 --override-os linux "docker://$img" "docker-archive:${ROOTFS_DIR}/tmp/docker-images/${dirname}.tar"

  on_chroot <<EOF
    docker load < "${ROOTFS_DIR}/var/lib/docker-images/${dirname}.tar"
EOF

  # Record mapping: dirname|original_name
  #echo "${dirname}|${img}" >> "${ROOTFS_DIR}/var/lib/docker-images/manifest.txt"
done

# Create a first-boot service to load the images into Docker
# cat > "${ROOTFS_DIR}/opt/raspocrate/load-images.sh" << 'SCRIPT'
# #!/bin/bash
# set -e
#
# MANIFEST="/var/lib/docker-images/manifest.txt"
# if [ ! -f "$MANIFEST" ]; then
#   echo "No manifest found, skipping image load"
#   exit 0
# fi
#
# while IFS='|' read -r dirname imgname; do
#   if [ -d "/var/lib/docker-images/${dirname}" ]; then
#     echo "Loading image: $imgname..."
#     skopeo copy "oci:/var/lib/docker-images/${dirname}" "docker-daemon:${imgname}"
#   fi
# done < "$MANIFEST"
#
# # Clean up after loading
rm -rf "${ROOTFS_DIR}/tmp/docker-images"
# systemctl disable raspocrate-load-images.service
# SCRIPT
#chmod +x "${ROOTFS_DIR}/opt/raspocrate/load-images.sh"

# cat > "${ROOTFS_DIR}/etc/systemd/system/raspocrate-load-images.service" << 'SERVICE'
# [Unit]
# Description=Load pre-pulled Docker images
# Requires=docker.service
# After=docker.service
# Before=raspocrate.service
#
# [Service]
# Type=oneshot
# ExecStart=/opt/raspocrate/load-images.sh
# RemainAfterExit=yes
#
# [Install]
# WantedBy=multi-user.target
# SERVICE
#
# on_chroot << EOF
# systemctl enable raspocrate-load-images.service
# EOF
