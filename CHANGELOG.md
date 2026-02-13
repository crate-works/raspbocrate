# [1.6.0](https://github.com/paradisec-archive/raspbocrate/compare/v1.5.0...v1.6.0) (2026-02-13)


### Features

* **opensearch:** add custom OpenSearch container image ([55d994a](https://github.com/paradisec-archive/raspbocrate/commit/55d994a13a8f7960d5cda91026d31c52de5fc588))

# [1.5.0](https://github.com/paradisec-archive/raspbocrate/compare/v1.4.2...v1.5.0) (2026-02-12)


### Features

* optimise hostapd setup ([17e85a4](https://github.com/paradisec-archive/raspbocrate/commit/17e85a44a8eac930a632d2d8d915681c2cc6c920))

## [1.4.2](https://github.com/paradisec-archive/raspbocrate/compare/v1.4.1...v1.4.2) (2026-02-11)


### Bug Fixes

* opensearch url ([7742375](https://github.com/paradisec-archive/raspbocrate/commit/77423756a7c3c50c058b2a190789f02f754988e6))

## [1.4.1](https://github.com/paradisec-archive/raspbocrate/compare/v1.4.0...v1.4.1) (2026-02-11)


### Bug Fixes

* base URL ([9273596](https://github.com/paradisec-archive/raspbocrate/commit/9273596fa81f48960e7260d83b70cf9b03be68ae))
* make build stage executable ([3f1a789](https://github.com/paradisec-archive/raspbocrate/commit/3f1a789280129736d9f3622a4144dfc704909abb))
* test image needs to be bigger ([57d9000](https://github.com/paradisec-archive/raspbocrate/commit/57d90000bfc0f3a3a8bea4906b329fa13df92871))

# [1.4.0](https://github.com/paradisec-archive/raspbocrate/compare/v1.3.1...v1.4.0) (2026-02-11)


### Bug Fixes

* update raspbocapi health check ([8f82f05](https://github.com/paradisec-archive/raspbocrate/commit/8f82f0568d69ae6147bc496931a1d79ec74b2d74))


### Features

* add dozzle for container management ([aebc487](https://github.com/paradisec-archive/raspbocrate/commit/aebc48771071ecc7fa5d00f50069458bcd4082f4))
* add nginx reverse proxy for path-based routing ([3e54433](https://github.com/paradisec-archive/raspbocrate/commit/3e544336e65d940a0ab1569f21d755a8eee042a6))

## [1.3.1](https://github.com/paradisec-archive/raspbocrate/compare/v1.3.0...v1.3.1) (2026-02-10)


### Bug Fixes

* simplify the mount options ([fd22c77](https://github.com/paradisec-archive/raspbocrate/commit/fd22c77fbdb16bddc93ede46286385fcc574a008))

# [1.3.0](https://github.com/paradisec-archive/raspbocrate/compare/v1.2.0...v1.3.0) (2026-02-09)


### Bug Fixes

* make search work ([b5a2401](https://github.com/paradisec-archive/raspbocrate/commit/b5a24016860cb273547717a6b85d1c0e66e1e48e))


### Features

* add reset data button and data stats to home page ([47d7ebc](https://github.com/paradisec-archive/raspbocrate/commit/47d7ebc549842facfa928321c492affef8ff2fd9))

# [1.2.0](https://github.com/paradisec-archive/raspbocrate/compare/v1.1.6...v1.2.0) (2026-02-09)


### Features

* flash Pi 5 power LED when all containers are healthy ([0f777b3](https://github.com/paradisec-archive/raspbocrate/commit/0f777b399863f2ad69bef2064ec16bc50bd3ffd8))

## [1.1.6](https://github.com/paradisec-archive/raspbocrate/compare/v1.1.5...v1.1.6) (2026-02-09)


### Bug Fixes

* correct the object types ([30577f2](https://github.com/paradisec-archive/raspbocrate/commit/30577f2c74cbd9bc399de593b72f0b6c58f785cc))

## [1.1.5](https://github.com/paradisec-archive/raspbocrate/compare/v1.1.4...v1.1.5) (2026-02-07)


### Bug Fixes

* add restart policy and opensearch dependency to raspbocapi ([3f307e2](https://github.com/paradisec-archive/raspbocrate/commit/3f307e20c9ee59e623682b348987872634b23b83))
* container dd and port settings ([fd459b6](https://github.com/paradisec-archive/raspbocrate/commit/fd459b6ec6428f9ef8f24f4acb01650462d99efe))
* raspocapi listneing on 0/0 ([52d867b](https://github.com/paradisec-archive/raspbocrate/commit/52d867b5591e0125fe892e81bc6e2d91b054ffc9))
* stop hostapd restarts ([2caf14e](https://github.com/paradisec-archive/raspbocrate/commit/2caf14ea8a960e1c16545748d4cb14825d707aa7))

## [1.1.4](https://github.com/paradisec-archive/raspbocrate/compare/v1.1.3...v1.1.4) (2026-02-07)


### Bug Fixes

* update raspbocapi package ([63b44fd](https://github.com/paradisec-archive/raspbocrate/commit/63b44fdb3fda0964d567c4c8f0dc01829478c334))

## [1.1.3](https://github.com/paradisec-archive/raspbocrate/compare/v1.1.2...v1.1.3) (2026-02-06)


### Bug Fixes

* make mysql connections not hang ([eb02ca2](https://github.com/paradisec-archive/raspbocrate/commit/eb02ca2bf249ad35b221335ea19b6e8a400ff282))
* preload the exact images in the docker compose ([3e4a97e](https://github.com/paradisec-archive/raspbocrate/commit/3e4a97ec3f94ccb70a01c28d16e8a8a2cee86570))
* you need power before wifi! ([ebaf489](https://github.com/paradisec-archive/raspbocrate/commit/ebaf489fb4a078a560be70e8613c61c5a6e04303))

## [1.1.2](https://github.com/paradisec-archive/raspbocrate/compare/v1.1.1...v1.1.2) (2026-02-06)


### Bug Fixes

* container config and ports ([dc91a1e](https://github.com/paradisec-archive/raspbocrate/commit/dc91a1ed403858ae8b649a66de2ca5c212d44f21))
* migrate the database ([5ae8a39](https://github.com/paradisec-archive/raspbocrate/commit/5ae8a39c7b0137f264d12a311ba342a0ac43eff6))
* temp drop mysql to 5 to remove locking issue ([8b16082](https://github.com/paradisec-archive/raspbocrate/commit/8b1608296ae3a7f8b36043f4c471b70e9a79fa4c))
* wrong Bind name in systemd service ([675a0b1](https://github.com/paradisec-archive/raspbocrate/commit/675a0b1b8f0d40e52c0902774b9de8f007e3e289))

## [1.1.1](https://github.com/paradisec-archive/raspbocrate/compare/v1.1.0...v1.1.1) (2026-02-06)


### Bug Fixes

* make stage exectuable ([bb54835](https://github.com/paradisec-archive/raspbocrate/commit/bb54835ce94a5569258e69ace8090fe51645d3de))
* pull the latest docker iages ([804ebbb](https://github.com/paradisec-archive/raspbocrate/commit/804ebbb5d7fd052d4c8fbb8b1da2b543636d11a7))

# [1.1.0](https://github.com/paradisec-archive/raspbocrate/compare/v1.0.0...v1.1.0) (2026-02-06)


### Bug Fixes

* devtools hydration issue ([ee3941f](https://github.com/paradisec-archive/raspbocrate/commit/ee3941fc24eb61d5f6cd0023a371e8c6249fb28c))
* map oni-ui port to 80 on host ([f523e20](https://github.com/paradisec-archive/raspbocrate/commit/f523e2033941e028ae5cab4dbfc2d6c76c41e97d))
* rasbocrate url ([7cb6596](https://github.com/paradisec-archive/raspbocrate/commit/7cb65968b8e03f6b94a43596286557f35ec69ec2))
* **raspbocapi:** drop unused rocrate column from Entity table ([0672b73](https://github.com/paradisec-archive/raspbocrate/commit/0672b730a0f617ec1018d181fb62d3980e2c71fe))
* **raspbocrate:** add notFoundComponent to root route ([b246b8e](https://github.com/paradisec-archive/raspbocrate/commit/b246b8ed249cb942579debb9afe3fa523bf750e0))
* **raspbocrate:** fix entity ID resolution and file size parsing ([742d40e](https://github.com/paradisec-archive/raspbocrate/commit/742d40ef1bea9e4a30877e80da10fdfc93046175))


### Features

* **image-builder:** add USB drive automounting ([1a69076](https://github.com/paradisec-archive/raspbocrate/commit/1a6907632913cd41fe0f20e8f6fe5ec63a04b51e))
* **raspbocrate:** add media directory scanning alongside USB drives ([a4a6de4](https://github.com/paradisec-archive/raspbocrate/commit/a4a6de4bb40c97d8912f90098d7be3f46a2f28ed))
* **raspbocrate:** show import errors in drive detail page ([d4949a5](https://github.com/paradisec-archive/raspbocrate/commit/d4949a58e0603dec6564d54ac1c074d1fcac7072))

# 1.0.0 (2026-02-06)


### Bug Fixes

* add pi user to docker group ([757dba0](https://github.com/paradisec-archive/raspbocrate/commit/757dba02fb250a6aaad92fc0baa2e5ab53745541))
* bad paths in image creation workflow ([346099e](https://github.com/paradisec-archive/raspbocrate/commit/346099e759b72b0b27110e9d50dd2f998689e9a7))
* broken apt-cache ([c258713](https://github.com/paradisec-archive/raspbocrate/commit/c25871399ede043710859130fc7a758564afa2d8))
* build paths ([f21c261](https://github.com/paradisec-archive/raspbocrate/commit/f21c2615f37b9bc4cd89ff1de56b168bb77b9e6c))
* config updates ([c1b0a94](https://github.com/paradisec-archive/raspbocrate/commit/c1b0a94c06045b42d891db3c173dd16e19a5b3b5))
* docker build ([d7c8536](https://github.com/paradisec-archive/raspbocrate/commit/d7c85365534eb691c117b3776d9e2fed44bfce94))
* docker build and country ([9a942fc](https://github.com/paradisec-archive/raspbocrate/commit/9a942fcd577dd339158b5450ffdf490e6904c25a))
* docker compose package name ([1cc5050](https://github.com/paradisec-archive/raspbocrate/commit/1cc5050d7c34e45239de6b13ef2f3529ec47f7c4))
* file paths ([77e50f8](https://github.com/paradisec-archive/raspbocrate/commit/77e50f816b355d222f5529aad2ba18abeea9f350))
* image creation permissions ([bf45242](https://github.com/paradisec-archive/raspbocrate/commit/bf45242783fcc081a1004b7a88a0460b437c7849))
* image path ([c8a407a](https://github.com/paradisec-archive/raspbocrate/commit/c8a407ae7b49b6dec54076f835b24eeb97651f4a))
* keyboard layout ([8191268](https://github.com/paradisec-archive/raspbocrate/commit/8191268067545c9758b31c1c4788ccd365dac408))
* keyboard layout ([c600390](https://github.com/paradisec-archive/raspbocrate/commit/c600390cab8df65fb153e4a2ddd574d53ca89a1b))
* liniting ([b14a4f4](https://github.com/paradisec-archive/raspbocrate/commit/b14a4f475590bf2c8abc955fcfd4a5bc600c19e5))
* make test image boot again on pi ([8b13eb6](https://github.com/paradisec-archive/raspbocrate/commit/8b13eb6de952365f3836097ddf436693b12e3476))
* on pi usb drive doesn't come up as hotplug ([5401177](https://github.com/paradisec-archive/raspbocrate/commit/540117751ff00a5b0293b90da088f6ae94c93287))
* pi docker compose config ([7f4cb4f](https://github.com/paradisec-archive/raspbocrate/commit/7f4cb4f089601e76770524bcdcefab45de7a7dbb))
* pi-gen fixes ([0cba5f5](https://github.com/paradisec-archive/raspbocrate/commit/0cba5f5cee697655bf9b38a382acaaf900948fb2))
* remove dotenv from raspbocapi ([af2dab4](https://github.com/paradisec-archive/raspbocrate/commit/af2dab4fc029d5108510c24a483c6d2d0d8e684f))
* rfkill needs to run earlier ([ae2ea68](https://github.com/paradisec-archive/raspbocrate/commit/ae2ea682efc1f0399e0fa60dc03b0978677fcc6c))
* set site URL for stiremap ([2b4d1af](https://github.com/paradisec-archive/raspbocrate/commit/2b4d1af6f878a776c2f2ba870f6fccd6000878b5))
* setup keyboard ([db8c239](https://github.com/paradisec-archive/raspbocrate/commit/db8c239e6dc1c36914b0b645468fcdd7540010be))
* tag docker images correctly ([441b5f0](https://github.com/paradisec-archive/raspbocrate/commit/441b5f07ae660c5d65c8933b33f4dafb64c02d5b))
* try building the image on arm ([514b740](https://github.com/paradisec-archive/raspbocrate/commit/514b740d44c9a8b28c81d7bf6c2e12214ae80bcc))
* typo ([83cefe7](https://github.com/paradisec-archive/raspbocrate/commit/83cefe73134bbf7600be189f642bcec6c60c1f99))


### Features

* add a base arocapi ([84b8add](https://github.com/paradisec-archive/raspbocrate/commit/84b8add527b8e67058cd5de357223377b5fc9d8f))
* add apt cache to speed up development ([a117bef](https://github.com/paradisec-archive/raspbocrate/commit/a117beffaea5570ad1c2334eb0ac8640b674e393))
* add base raspbocrate app ([e7e39e5](https://github.com/paradisec-archive/raspbocrate/commit/e7e39e5d525d4b4fb64efc723f97ba08539b81c8))
* add GitHub Actions workflow for Docker publishing ([03536df](https://github.com/paradisec-archive/raspbocrate/commit/03536df1e990ec8bbec67578395ab3c0183886eb))
* add GitHub workflow for Raspberry Pi image builds ([ae94e13](https://github.com/paradisec-archive/raspbocrate/commit/ae94e132d4e97076f0ec92f5c9da95a6e9971951))
* Dockerfile for raspbocrate ([6d03e69](https://github.com/paradisec-archive/raspbocrate/commit/6d03e69befb53dd8b368d6eba3463d6c045ba888))
* drive listing ([c267fc0](https://github.com/paradisec-archive/raspbocrate/commit/c267fc0dd4811f76e23ffb4ee87251ed9d02ddb9))
* **image-builder:** add WiFi access point configuration ([6d4488e](https://github.com/paradisec-archive/raspbocrate/commit/6d4488e0ab5a34ae98b2e4a3bda81285c844fa64))
* integrate oni-ui and upgrade arocapi to v2 ([cf2b9a2](https://github.com/paradisec-archive/raspbocrate/commit/cf2b9a293a8564c2f0c3bfb1363a7c9c88793258))
* move all generated files to a tmp directory ([3a7c800](https://github.com/paradisec-archive/raspbocrate/commit/3a7c800656f2ab0f53266cd9faf052be6ecd5f1f))
* test-image script ([6b07dc8](https://github.com/paradisec-archive/raspbocrate/commit/6b07dc8f5e24d02795ae783597b80737a94c8d3a))
* tree structure of rocrate ([a956c44](https://github.com/paradisec-archive/raspbocrate/commit/a956c446d21e443ede24f9eea4105de2a0c4a8e8))
* update raspocapi docker file ([8c41c4b](https://github.com/paradisec-archive/raspbocrate/commit/8c41c4be1a2af1dde1857baee3e2e5ab2b1a763c))
* **website:** add Astro-based documentation website ([5ef19c2](https://github.com/paradisec-archive/raspbocrate/commit/5ef19c20b66ef12630575843181f7705207d9ba5))
