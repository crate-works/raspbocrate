#!/bin/bash
set -e

HOSTAPD_CONF="/etc/hostapd/hostapd.conf"

# Get last 4 chars of wlan0 MAC address
get_mac_suffix() {
  cat /sys/class/net/wlan0/address 2>/dev/null | tr -d ':' | tail -c 5 | tr '[:lower:]' '[:upper:]'
}

if [ ! -d /sys/class/net/wlan0 ]; then
  echo "ERROR: wlan0 not found"
  exit 1
fi

MAC_SUFFIX=$(get_mac_suffix)
NEW_SSID="raspbocrate-${MAC_SUFFIX}"

echo "Setting up WiFi AP: ${NEW_SSID}"

# Unblock WiFi
rfkill unblock wlan 2>/dev/null || true

# Update SSID in hostapd config
sed -i "s/^ssid=.*/ssid=${NEW_SSID}/" "$HOSTAPD_CONF"

# Set static IP on wlan0
ip addr flush dev wlan0 2>/dev/null || true
ip addr add 192.168.4.1/24 dev wlan0
ip link set wlan0 up

# Set Australian regulatory domain
iw reg set AU 2>/dev/null || true

echo "AP ready: ${NEW_SSID} @ 192.168.4.1"
