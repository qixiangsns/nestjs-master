import PackageInfo from '@package' with { type: 'json' };

export function versionMixin() {
  return {
    version: PackageInfo.version,
  };
}
