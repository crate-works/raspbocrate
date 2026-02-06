/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        // biome-ignore lint/suspicious/noTemplateCurlyInString: not JS code
        verifyReleaseCmd: 'echo ${nextRelease.version} > .version',
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'pi-image/*.img.xz', label: 'Raspberry Pi Image' },
          {
            path: 'pi-image/*.img.xz.sha256',
            label: 'Raspberry Pi Image Checksum',
          },
        ],
      },
    ],
  ],
};
