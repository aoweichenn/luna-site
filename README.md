# Luna Compiler Lab

Luna 系统语言与 C23 自举编译器的独立学习站点。站点通过交互式编译路径、
阶段化课程、工程规范和验证矩阵，帮助读者从 Luna 源码一路理解到 x86-64
ELF64。

生产站点：
<https://luna-compiler-lab.aoweichenn.chatgpt.site>

源码仓库：
<https://github.com/aoweichenn/luna-site>

## 内容基线

当前页面对应 Luna 仓库提交 `04e9522`：
`Implement f32 and f64 end to end`。

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
