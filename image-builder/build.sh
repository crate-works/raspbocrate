#!/usr/bin/env bash

set -e

apt install quilt qemu-user-static debootstrap zerofree libarchive-tools arch-test

git clone --depth 1 https://github.com/RPI-Distro/pi-gen.git
cd pi-gen

cp pi-gen/work/raspios-trixie-armhf/export-image/*lite.img rasbocrate.img
