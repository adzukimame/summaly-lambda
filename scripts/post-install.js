import { readFileSync, writeFileSync } from 'node:fs';

// esbuildでバンドルした結果ディレクトリ構造が変わるのでそのままだとreadFileSyncでエラーが発生する
{
  const content = readFileSync('node_modules/@misskey-dev/summaly/built/utils/got.js', { encoding: 'utf8' });

  /* eslint-disable @stylistic/quotes */
  writeFileSync(
    'node_modules/@misskey-dev/summaly/built/utils/got.js',
    content.replace(
      "const repo = JSON.parse(readFileSync(`${_dirname}/../../package.json`, 'utf8'));",
      "const repo = { version: '5.1.0' };"
    )
  );
  /* eslint-enable @stylistic/quotes */
}
