#!/bin/bash -ex

# Install hostapd configuration
install -m 644 files/hostapd.conf "${ROOTFS_DIR}/etc/hostapd/hostapd.conf"

# Install dnsmasq configuration
install -m 644 files/dnsmasq-ap.conf "${ROOTFS_DIR}/etc/dnsmasq.d/raspbocrate-ap.conf"

# Tell NetworkManager to ignore wlan0
install -d "${ROOTFS_DIR}/etc/NetworkManager/conf.d"
install -m 644 files/NetworkManager-wlan0.conf "${ROOTFS_DIR}/etc/NetworkManager/conf.d/99-raspbocrate-ap.conf"

# Install AP setup script
install -m 755 files/ap-setup.sh "${ROOTFS_DIR}/opt/raspbocrate/ap-setup.sh"

# Install systemd services
install -m 644 files/raspbocrate-ap-setup.service "${ROOTFS_DIR}/etc/systemd/system/raspbocrate-ap-setup.service"

install -d "${ROOTFS_DIR}/etc/systemd/system/hostapd.service.d"
install -m 644 files/hostapd.service.d-override.conf "${ROOTFS_DIR}/etc/systemd/system/hostapd.service.d/override.conf"

install -d "${ROOTFS_DIR}/etc/systemd/system/dnsmasq.service.d"
install -m 644 files/dnsmasq.service.d-override.conf "${ROOTFS_DIR}/etc/systemd/system/dnsmasq.service.d/override.conf"

# Enable services
on_chroot <<EOF
  systemctl enable raspbocrate-ap-setup.service
  systemctl unmask hostapd
  systemctl enable hostapd
  systemctl enable dnsmasq
  systemctl enable avahi-daemon
EOF
