# git-repo-clone ![npm license](https://img.shields.io/npm/l/git-repo-clone.svg?sanitize=true) ![npm version](https://img.shields.io/npm/v/git-repo-clone.svg?sanitize=true)

git clone 仓库，只实现 clone 用于解决 download-git-repo 中出现交互，则命令行无法直接卡死的问题。

## 安装

```bash
# yarn
yarn add git-repo-clone

# npm
npm install git-repo-clone
```

## 使用方法

```javascript
  function clone(
    gitHref: string,
    branch?: string | undefined,
    dir?: string | undefined,
    empty?: boolean
  ): Promise<string>;
```

- `gitHref`: git 地址，例如 `https://github.com/darkXmo/git-repo-clone.git` 或 `https://gitee.com/dXmo/xmo-cli.git` ;

- `branch`: git 分支，建议填写，例如 `master` 、 `development` 、 `production` 。

- `dir`: 本地位置，即将仓库放在本地哪个目录下，默认为 Git 仓库名。

- `empty`: clone 之后是否清空 `.git` 。

- 返回值：clone 下载的仓库的绝对地址，例如 `/home/xmo/code/git-repo-clone/testDirBranch` ;

### Examples

```javascript
import { clone } from "git-repo-clone";

clone("https://github.com/darkXmo/xmo-cli.git");

await clone("https://github.com/darkXmo/xmo-cli.git", "primary");

const dir = await clone(
  "https://github.com/darkXmo/xmo-cli.git",
  undefined,
  "localDir"
);

const dir: string = await clone(
  "https://github.com/darkXmo/xmo-cli.git",
  "primary",
  "localDir"
);

const dir: string = await clone(
  "https://github.com/darkXmo/xmo-cli.git",
  "primary",
  "localDir",
  true
);

const dir: string = await clone(
  "https://github.com/darkXmo/xmo-cli.git",
  undefined,
  undefined,
  true
);
```

> 如果需要使用 `dir` 参数又不想指定 `branch` ，就用 `undefined` 补全空位即可。

## 为什么不用 download-git-repo

download-git-repo 遇到

```bash
The authenticity of host 'github.com (20.205.243.166)' can't be established.
RSA key fingerprint is SHA256:xxxxxxxxxxxxxxxxxx.
```

无法启动交互，会卡死。

另外，`git-repo-clone` 使用 `typescript` 开发，类型检查更加到位。
