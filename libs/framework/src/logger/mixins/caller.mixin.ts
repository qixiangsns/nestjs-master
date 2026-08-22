export function callerMixin(stackTrace?: string) {
  if (!stackTrace) {
    return {};
  }
  let filePath: string | null = null;
  const callerTrace = stackTrace
    .split('\n')
    .at(-1)
    ?.match(/\(([^)]+)\)/)?.[1];

  // Get executing node file
  const appName = process.argv[1].split('/').at(-2) || null;
  const fileRelativePath = callerTrace?.split(`webpack://${appName}/`)[1];
  if (appName && callerTrace && fileRelativePath) {
    filePath = `${process.cwd()}/${fileRelativePath}`;
  }

  return {
    ...(filePath ? { logged_by: filePath } : {}),
  };
}
