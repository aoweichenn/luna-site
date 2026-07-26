# 内容维护说明

本文件定义网站内容与 Luna 主仓库之间的映射，防止展示状态先于实现。

## 权威来源

| 页面内容 | Luna 权威来源 |
| --- | --- |
| 语言语法和接受的类型 | `docs/language.md` |
| 编译流水线与边界 | `docs/architecture.md` |
| 整数、浮点与求值行为 | `docs/execution-semantics.md` |
| M0–M4 完成状态 | `docs/roadmap.md` |
| 测试总数与测试名称 | `ctest --test-dir build/debug -N` |
| 示例 Source / IR | `tests/integration/cases/floating_ir.luna` 与对应 golden IR |
| C23 和严格告警 | `CMakeLists.txt` |
| 格式约定 | `.clang-format` |
| 站内完整文档与源码 | `content/luna-snapshot.json`，由 Git 跟踪文件生成 |

“源码文件数”和“源码行数”只统计 `src/`、`include/` 与 `examples/`。测试、
文档、CI、构建配置可以在完整项目树中浏览，但不得计入源码统计。

## 中文文档

`content/docs-zh/*.md` 是 Luna 五篇核心英文文档的完整中文译文。术语、类型名、
命令、代码与 ABI 名称保持原样；内容含义必须与同一快照中的英文原文一致。
修改译文后运行 `npm run sync:docs`，并同时抽查中文页与 `/en` 英文原文页。

## 状态用语

- “已实现”要求 roadmap 已勾选，并且存在可执行测试。
- “已接受”只表示语言设计已经记录，不能暗示编译器可以编译。
- “下一阶段”来自 roadmap 中当前里程碑的首个未完成依赖闭环。
- 预计数据不能写成已完成数据。

## 更新步骤

Luna 主仓库有新阶段提交后：

1. 阅读该提交涉及的语言、架构、执行语义和 roadmap 变更；
2. 运行 `ctest --test-dir build/debug -N`，更新可见测试数量；
3. 在站点仓库运行 `npm run sync:content`，确认提交、文件数和行数；
4. 对照英文变更更新 `content/docs-zh/`，运行 `npm run sync:docs`；
5. 用当前 `lunac` 重新产生网页展示的 IR 和 assembly；
6. 更新首页提交基线、M1 计数、完成项和下一阶段；
7. 抽查中英文文档页与前端、IR、后端、测试等完整源码文件；
8. 运行 `npm run check`；
9. 在 390、768 和 1440 像素视口检查页面；
10. 按 `docs/release-process.md` 提交并发布同一个源码状态。

## 文案原则

先解释边界和原因，再给结论。站内文档是为阅读体验生成的完整镜像，Luna
仓库原文仍是权威来源，每篇文档和每个源码文件都必须保留原仓库入口。面向
学习者时可以在独立页面增加导读，但不能改写原文中的类型规则、ABI 或执行语义。
