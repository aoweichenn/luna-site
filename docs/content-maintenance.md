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
| 示例 Source / IR / assembly | `tests/integration/cases/floating_ir.luna` |
| C23 和严格告警 | `CMakeLists.txt` |
| 格式约定 | `.clang-format` |

## 状态用语

- “已实现”要求 roadmap 已勾选，并且存在可执行测试。
- “已接受”只表示语言设计已经记录，不能暗示编译器可以编译。
- “下一阶段”来自 roadmap 中当前里程碑的首个未完成依赖闭环。
- 预计数据不能写成已完成数据。

## 更新步骤

Luna 主仓库有新阶段提交后：

1. 阅读该提交涉及的语言、架构、执行语义和 roadmap 变更；
2. 运行 `ctest --test-dir build/debug -N`，更新可见测试数量；
3. 用当前 `lunac` 重新产生网页展示的 IR 和 assembly；
4. 更新首页提交基线、M1 计数、完成项和下一阶段；
5. 运行 `npm run check`；
6. 在 390、768 和 1440 像素视口检查页面；
7. 按 `docs/release-process.md` 提交并发布同一个源码状态。

## 文案原则

先解释边界和原因，再给结论。尽量链接到原始文档，不用网页副本取代仓库文档。
面向学习者时可以简化表达，但不能改变类型规则、ABI 或执行语义。
