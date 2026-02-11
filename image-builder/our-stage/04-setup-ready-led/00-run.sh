#!/bin/bash -ex

install -m 755 files/raspbocrate-ready-led.sh "${ROOTFS_DIR}/opt/raspbocrate/raspbocrate-ready-led.sh"
install -m 644 files/raspbocrate-ready-led.service "${ROOTFS_DIR}/etc/systemd/system/raspbocrate-ready-led.service"

on_chroot <<EOF
  systemctl enable raspbocrate-ready-led.service
EOF
