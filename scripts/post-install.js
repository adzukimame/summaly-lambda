import * as fs from 'node:fs';

// esbuildでバンドルした結果ディレクトリ構造が変わるのでそのままだとreadFileSyncでエラーが発生する
{
  const content = fs.readFileSync('node_modules/@misskey-dev/summaly/built/utils/got.js');

  /* eslint-disable @stylistic/quotes */
  fs.writeFileSync(
    'node_modules/@misskey-dev/summaly/built/utils/got.js',
    content.toString('utf8').replace(
      "const repo = JSON.parse(readFileSync(`${_dirname}/../../package.json`, 'utf8'));",
      "const repo = { version: '5.1.0' };"
    )
  );
  /* eslint-enable @stylistic/quotes */
}
