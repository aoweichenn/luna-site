# 发布流程

站点使用 GitHub 和 ChatGPT Sites 两个远端。两者必须指向同一个已验证提交，
这样任意机器都能复现线上版本。

## 首次克隆

```sh
git clone ssh://git@ssh.github.com:443/aoweichenn/luna-site.git
cd luna-site
npm ci
npm run check
```

确认 `.openai/hosting.json` 中已有 `project_id`。如果存在，必须复用该站点，
不能再次创建。

## 日常更新

```sh
npm ci
npm run sync:content
npm run sync:docs
npm run check
git add --all
git commit
git push origin main
```

`origin` 使用 SSH：

```text
ssh://git@ssh.github.com:443/aoweichenn/luna-site.git
```

随后把同一个 `HEAD` 推送到 Sites 源码远端。保存 Sites 版本时使用该远端
`main` 分支的精确提交 SHA，保存成功后再部署这个版本。

## 发布不变量

- 未通过 `npm run check` 的源码不发布；
- `content/luna-snapshot.json` 的提交必须与页面标示的 Luna 基线一致；
- 中文译文与 `content/docs-zh.json` 必须同步；
- 构建产物必须包含 `dist/server/index.js` 和
  `dist/.openai/hosting.json`；
- GitHub 与 Sites 的 `main` 必须包含同一个提交；
- Sites 版本只能引用已经推送的提交；
- `.openai/hosting.json` 只保存非敏感项目标识；
- 短期 Sites 写入凭据只能按命令使用，不能写入远端 URL、配置或文件；
- 生产地址由 Sites 部署结果确认，不能用本地推断代替。

## 回滚

不要重写已发布历史。修复旧版本时，从对应提交建立新提交，通过完整门禁，
再保存并部署一个新的 Sites 版本。
