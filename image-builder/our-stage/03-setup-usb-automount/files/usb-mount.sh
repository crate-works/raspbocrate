#!/bin/bash

set -euo pipefail

ACTION="$1"
DEVICE="$2"
DEVICE_PATH="/dev/${DEVICE}"
STATE_FILE="/run/usb-mount-${DEVICE}"

sanitise_label() {
  # Replace non-alphanumeric characters (except hyphens and underscores) with underscores
  local label="$1"
  echo "${label//[^a-zA-Z0-9._-]/_}"
}

do_mount() {
  if [[ ! -b "${DEVICE_PATH}" ]]; then
    echo "Device ${DEVICE_PATH} does not exist"

    exit 1
  fi

  # Get filesystem label, fall back to device name
  LABEL=$(lsblk -n -o LABEL "${DEVICE_PATH}" | head -1 | xargs)
  if [[ -z "${LABEL}" ]]; then
    LABEL="${DEVICE}"
  fi

  LABEL=$(sanitise_label "${LABEL}")
  MOUNT_POINT="/media/${LABEL}"

  # Handle duplicate labels by appending device name
  if mountpoint -q "${MOUNT_POINT}" 2>/dev/null; then
    MOUNT_POINT="/media/${LABEL}-${DEVICE}"
  fi

  mkdir -p "${MOUNT_POINT}"

  # Detect filesystem type for mount options
  FS_TYPE=$(lsblk -n -o FSTYPE "${DEVICE_PATH}" | head -1 | xargs)

  MOUNT_OPTS="defaults"
  case "${FS_TYPE}" in
  vfat | exfat)
    MOUNT_OPTS="defaults,uid=1000,gid=1000,umask=022"
    ;;
  ntfs | ntfs3)
    MOUNT_OPTS="defaults,uid=1000,gid=1000"
    ;;
  esac

  mount -o "${MOUNT_OPTS}" "${DEVICE_PATH}" "${MOUNT_POINT}"

  # Record mount point for cleanup
  echo "${MOUNT_POINT}" >"${STATE_FILE}"

  echo "Mounted ${DEVICE_PATH} at ${MOUNT_POINT}"
}

do_unmount() {
  if [[ ! -f "${STATE_FILE}" ]]; then
    echo "No state file for ${DEVICE}, nothing to unmount"

    exit 0
  fi

  MOUNT_POINT=$(cat "${STATE_FILE}")

  if mountpoint -q "${MOUNT_POINT}" 2>/dev/null; then
    umount "${MOUNT_POINT}"
  fi

  if [[ -d "${MOUNT_POINT}" ]]; then
    rmdir "${MOUNT_POINT}" 2>/dev/null || true
  fi

  rm -f "${STATE_FILE}"

  echo "Unmounted ${DEVICE_PATH} from ${MOUNT_POINT}"
}

case "${ACTION}" in
mount)
  do_mount
  ;;
unmount)
  do_unmount
  ;;
*)
  echo "Usage: $0 {mount|unmount} <device>"

  exit 1
  ;;
esac
