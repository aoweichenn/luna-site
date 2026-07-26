# Luna 0 语言草案

本文记录第一阶段已经接受的表层设计。它比当前编译器已实现的子集更广；实现状态
单独记录在 `roadmap.md`。

## 源码单元与模块

接口单元以以下内容开始：

```luna
export module compiler.token;
```

实现单元或可执行单元以以下内容开始：

```luna
module compiler.token;
```

Import 位于模块声明之后：

```luna
import core.text;
import compiler.ast;
```

一个模块最多拥有一个接口单元和一个实现单元。只有接口中标记为 `export` 的声明
对 import 方可见。模块名组织可见性与依赖，但不会产生限定名称语法；导入的名称
直接使用。

Luna 0 不提供模块分区、header unit、re-export、别名、选择性 import、通配符
import 或循环依赖。

## 声明

类型写在名称之后：

```luna
let count: usize = 0;
var cursor: *Token = null;
const BUFFER_SIZE: usize = 4096;
```

所有声明都有显式类型和初始化器。`let` 绑定不能重新赋值，`var` 绑定可以。

```luna
struct Token {
    kind: TokenKind;
    text: Str;
}

union Number {
    integer: i64;
    real: f64;
}

enum TokenKind: u8 {
    identifier,
    integer,
    end,
}
```

枚举拥有显式底层整数类型，其值位于枚举类型作用域内，并且永远不会隐式转换为
整数。

## 类型

```text
bool
i8 i16 i32 i64
u8 u16 u32 u64
isize usize
f32 f64
void
```

`isize` 和 `usize` 具有目标指针宽度。它们保持为精确、彼此独立的语言类型：
即使当前目标给予它们与 `i64`、`u64` 相同的表示，混用时仍然需要显式转换。

复合类型语法：

```luna
value: i32;
pointer: *i32;
readonly: *const i32;
buffer: [256]u8;
matrix: [4][4]f32;
callback: fn(i32, i32) -> i32;
```

数组不会退化为指针。不存在隐式整数提升、隐式指针/整数转换或 truthiness 转换。

## 函数

```luna
fn add(left: i32, right: i32) -> i32 {
    return left + right;
}

fn report(message: *const u8) {
    write_line(message);
}

extern fn allocate(size: usize) -> *void;
```

参数按值传递，参数绑定不可变。指针参数显式表达修改。Luna 函数不支持重载、
默认参数或可变参数。

## 语句

条件必须是 `bool`，控制流 body 必须使用花括号。

```luna
if (ready) {
    run();
} else {
    wait();
}

while (running) {
    step();
}

do {
    step();
} while (running);

for (var index: usize = 0; index < count; index += 1) {
    process(index);
}
```

Switch case 拥有自己的作用域，并且绝不 fall through：

```luna
switch (token.kind) {
    case TokenKind.identifier, TokenKind.integer {
        parse_literal();
    }

    default {
        report_error();
    }
}
```

跳转语句包括 `break`、`continue`、`return` 和 `return value`。Luna 0 没有
label 或 `goto`。

## 表达式

后缀操作包括调用、下标、值成员访问与指针成员访问：

```luna
function(argument)
array[index]
value.field
pointer->field
```

一元运算符为 `+ - ! ~ * &`。

没有后缀的整数字面量采用其声明、return、参数或外层整数表达式所要求的整数
类型。不存在整数上下文时，默认为 `i32`。这条规则只作用于字面量，不会转换
一个已经具有类型的值。

十进制浮点字面量必须含有小数点且小数点两侧都有数字，或者含有指数：

```luna
let single: f32 = 1.25;
let double: f64 = 6.022_140_76e23;
let default_comparison: bool = 1e-9 == 1e-9;
```

下划线可以分隔整数部分、小数部分和指数部分中的数字。浮点字面量采用声明、
return、参数或外层浮点表达式要求的 `f32` 或 `f64` 类型。没有浮点上下文时，
默认为 `f64`。`f32` 字面量直接舍入到 binary32，不会先舍入到 binary64。

二元运算符按结合强度从高到低分组如下：

```text
* / %
+ -
<< >>
< <= > >=
== !=
&
^
|
&&
||
?:
```

显式转换使用 `as`：

```luna
let wide: i64 = small as i64;
let raw: *void = pointer as *void;
```

整数扩宽时，有符号源执行符号扩展，无符号源执行零扩展。缩窄保留低位；同宽
改变有无符号属性时保持位模式。整数转换永远不会 trap。即使目标类型能够表示
源值，也不会因此发生隐式转换。规则同样适用于 `isize` 和 `usize`；它们作为
源或目标时的宽度来自所选目标数据布局。

已实现的浮点运算符是一元 `+`、`-`，算术 `+`、`-`、`*`、`/`，以及所有
相等与顺序比较。普通赋值与复合赋值保持变量的精确声明类型。整数与浮点之间
不存在隐式转换，`f32` 与 `f64` 之间也不存在隐式转换。涉及浮点类型的显式
转换保留到下一个标量语言阶段。

赋值和复合赋值是语句，不是表达式。语言没有自增、自减或逗号运算符。

## 初始化

```luna
var buffer: [256]u8 = {};

let point: Point = {
    x = 10.0,
    y = 20.0,
};

return Point {
    x = 10.0,
    y = 20.0,
};
```

`{}` 表示显式零初始化。局部变量永远不会处于隐式未初始化状态。

## 编译期表层

Luna 0 唯一的编译期声明是具有类型的常量和枚举值。它没有预处理器、文本宏系统、
条件编译、泛型选择、类型反射或用户自定义 attribute 语法。

