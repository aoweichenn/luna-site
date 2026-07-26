# Luna Compiler Lab

Luna 系统语言与 C23 自举编译器的独立学习站点。站点把内容拆为学习路径、
编译器、文档、完整源码、C23 工程规范和实现路线图等独立页面，帮助读者从
Luna 源码一路理解到 x86-64 ELF64。

当前源码浏览器包含 Luna 基线提交的全部 165 个受版本控制文件，而不是经过
删减的示例片段。页面中的“源码统计”只计算 `src/`、`include/` 和
`examples/`，不把测试、文档、CI 或构建配置计入源码行数。文档页同样展示
仓库原文，并提供目录、代码排版和原文件入口。

生产站点：
<https://luna-compiler-lab.aoweichenn.chatgpt.site>

源码仓库：
<https://github.com/aoweichenn/luna-site>

## 内容基线

当前页面对应 Luna 仓库提交 `04e9522`：
`Implement f32 and f64 end to end`。

对应完整项目树快照包含 165 个文件、14,395 行文本；其中主干源码为 33 个
文件、7,770 行。快照保存在
`content/luna-snapshot.json`。这个快照已提交到站点仓库，因此站点在没有
Luna 相邻目录的机器和生产构建环境中也能独立构建。

五篇核心文档的完整中文译文位于 `content/docs-zh/`，页面默认显示中文，并在
每篇文档内提供英文原文入口。英文内容始终直接来自 Luna 快照，不被翻译文件
覆盖。

页面遵循三条内容约束：

1. 语言草案描述已经接受的设计；
2. roadmap 只把有可执行测试的能力标为完成；
3. 页面中的项目状态必须同时能在 Luna 文档和测试中找到依据。

详细映射见 [内容维护说明](docs/content-maintenance.md)。

## 本地开发

要求 Node.js 22 或更高版本。

```sh
npm ci
npm run dev
```

`npm run dev` 使用标准 Next.js 开发服务器。需要验证与 Sites 一致的运行时
时，可以使用：

```sh
npm run dev:vinext
```

提交前运行完整本地门禁：

```sh
npm run check
```

## 同步 Luna 内容

当 Luna 主仓库产生新的已验证提交时，在两个仓库保持相邻目录的机器上运行：

```sh
npm run sync:content
```

默认读取 `../luna`。如果源码位于其他位置，可显式传入：

```sh
LUNA_SOURCE_ROOT=/absolute/path/to/luna npm run sync:content
```

同步脚本只读取 Luna 的 Git `HEAD` 与 `git ls-files`，不会收录工作区中的
未跟踪文件。生成结果包含提交标识、提交时间、统计数据、每个文件的完整文本与
SHA-256，完成后应当审阅并提交生成文件。

修改中文译文后运行：

```sh
npm run sync:docs
```

它会从 `content/docs-zh/*.md` 生成构建所需的 `content/docs-zh.json`。
`dev`、`dev:vinext`、`lint` 和 `build` 已自动执行这一步。

生产构建使用 Sites 支持的 vinext 运行格式。门禁会生成
`dist/server/index.js`，并把站点绑定信息复制到
`dist/.openai/hosting.json`；两者都是发布前必须存在的产物。

## 仓库与发布

站点源码使用两个远端：

- `origin`：GitHub，供多台机器协作和长期保存；
- `sites`：ChatGPT Sites 源码仓库，供保存版本和生产发布。

`.openai/hosting.json` 已绑定现有 Luna Compiler Lab 项目。在其他机器克隆
后必须复用其中的 `project_id`，不能重复创建站点。

完整双远端流程见 [发布流程](docs/release-process.md)。
