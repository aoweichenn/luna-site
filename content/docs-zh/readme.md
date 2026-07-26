# Luna

Luna 是一门小型、强类型的系统语言，源自 C23 的过程式核心。自举编译器使用
C23 编写，将 Luna 直接降低到强类型控制流 IR 和 x86-64 后端，不经由 C 或
C++ 转译。

项目当前有意保持较窄的范围：

- 目标平台：x86-64 Linux、System V ABI、ELF64；
- 前端：显式的 `bool`、`i8`、`i16`、`i32`、`i64`、`isize`、`u8`、
  `u16`、`u32`、`u64`、`usize`、`f32` 和 `f64` 类型，经过检查的整数
  转换，以及函数、表达式、局部变量和结构化控制流；
- 中端：强类型、非 SSA 的控制流 IR；
- 目标模型：显式的 `x86_64-unknown-linux-gnu` 数据布局，以及由目标决定
  宽度的 `isize` 和 `usize`；
- 后端：直接、无优化的 x86-64 指令选择，包括 IEEE-754 标量 SSE 浮点运算；
- 自举宿主：符合标准的 C23，并支持 IEC 60559 binary32 与 binary64；
- 质量门禁：告警即错误、GoogleTest 单元测试、负例、IR 快照、差分随机程序、
  libFuzzer 和可执行的跨目标测试。

语言和编译器仍在积极建设。已实现语法与已接受语言设计分开跟踪，确保文档不会
把尚未完成的能力描述成可用功能。

## 构建

```sh
cmake --preset debug
cmake --build --preset debug
ctest --preset debug
```

检查未定义行为：

```sh
cmake --preset sanitize
cmake --build --preset sanitize
ctest --preset sanitize
```

`asan` preset 会在原生 Linux 与 CI 环境中加入 AddressSanitizer。部分
Android/PRoot AArch64 环境无法为 ASan 保留影子地址空间；这一宿主限制发生在
测试进程进入 `main` 之前。

启用 `BUILD_TESTING` 时，需要 GoogleTest 1.14 或更高版本以及 Python 3.10
或更高版本。测试组可以独立运行：

```sh
ctest --preset debug -L unit
ctest --preset debug -L integration
ctest --preset debug -L random
```

基于覆盖率引导的 fuzz 门禁使用 Clang：

```sh
cmake --preset fuzz
cmake --build --preset fuzz
ctest --preset fuzz -L fuzz
```

原生 Linux CI 还会使用 `fuzz-asan` preset 运行同一个目标。

## 编译

```sh
build/debug/lunac --target x86_64-unknown-linux-gnu \
  --emit asm -o hello.s examples/hello.luna
llvm-mc --triple=x86_64-unknown-linux-gnu --filetype=obj \
  -o hello.o hello.s
ld.lld -static -e _start -o hello hello.o
qemu-x86_64-static ./hello
```

`--target` 默认是 `x86_64-unknown-linux-gnu`，也是当前唯一支持的目标。在
x86-64 Linux 宿主上，如果没有 `qemu-x86_64-static`，集成与差分测试运行器
会直接执行生成的静态二进制文件。

继续阅读[语言草案](docs/language.md)、[编译器架构](docs/architecture.md)、
[自举执行语义](docs/execution-semantics.md)和[实现路线图](docs/roadmap.md)。

