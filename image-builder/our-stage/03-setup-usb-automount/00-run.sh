#!/bin/bash -ex

# Install udev rule for USB automounting
install -m 644 files/99-usb-automount.rules "${ROOTFS_DIR}/etc/udev/rules.d/99-usb-automount.rules"

# Install systemd service template
install -m 644 files/usb-mount@.service "${ROOTFS_DIR}/etc/systemd/system/usb-mount@.service"

# Install mount/unmount script
install -d "${ROOTFS_DIR}/opt/raspbocrate"
install -m 755 files/usb-mount.sh "${ROOTFS_DIR}/opt/raspbocrate/usb-mount.sh"
