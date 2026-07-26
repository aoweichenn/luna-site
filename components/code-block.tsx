import { Fragment } from "react";

type TokenKind =
  | "comment"
  | "directive"
  | "function"
  | "keyword"
  | "number"
  | "operator"
  | "plain"
  | "string"
  | "type"
  | "variable";

type Token = {
  kind: TokenKind;
  text: string;
};

type LexerState = {
  blockComment: boolean;
};

const cKeywords = new Set([
  "_Alignas",
  "_Alignof",
  "_Atomic",
  "_Bool",
  "_Generic",
  "_Noreturn",
  "_Static_assert",
  "_Thread_local",
  "alignas",
  "alignof",
  "auto",
  "bool",
  "break",
  "case",
  "char",
  "const",
  "constexpr",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extern",
  "false",
  "float",
  "for",
  "goto",
  "if",
  "inline",
  "long",
  "nullptr",
  "register",
  "restrict",
  "return",
  "short",
  "signed",
  "sizeof",
  "static",
  "static_assert",
  "struct",
  "switch",
  "thread_local",
  "true",
  "typedef",
  "typeof",
  "typeof_unqual",
  "union",
  "unsigned",
  "void",
  "volatile",
  "while",
]);

const cppKeywords = new Set([
  ...cKeywords,
  "catch",
  "class",
  "concept",
  "delete",
  "explicit",
  "friend",
  "namespace",
  "new",
  "noexcept",
  "operator",
  "override",
  "private",
  "protected",
  "public",
  "requires",
  "template",
  "this",
  "throw",
  "try",
  "using",
  "virtual",
]);

const lunaKeywords = new Set([
  "as",
  "break",
  "case",
  "const",
  "continue",
  "default",
  "do",
  "else",
  "enum",
  "export",
  "extern",
  "false",
  "fn",
  "for",
  "if",
  "import",
  "let",
  "module",
  "null",
  "return",
  "struct",
  "switch",
  "true",
  "union",
  "var",
  "while",
]);

const languageTypes = new Set([
  "bool",
  "f32",
  "f64",
  "i8",
  "i16",
  "i32",
  "i64",
  "isize",
  "u8",
  "u16",
  "u32",
  "u64",
  "usize",
  "void",
]);

const pythonKeywords = new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
]);

const lirKeywords = new Set([
  "add",
  "and",
  "ashr",
  "br",
  "call",
  "const",
  "div",
  "eq",
  "false",
  "fn",
  "ge",
  "gt",
  "ir",
  "le",
  "load",
  "lshr",
  "lt",
  "mod",
  "mul",
  "ne",
  "neg",
  "not",
  "or",
  "return",
  "shl",
  "store",
  "sub",
  "target",
  "true",
  "xor",
]);

const operatorCharacters = new Set(
  "+-*/%=!<>&|^~?:.,;()[]{}".split(""),
);

function languageKeywords(language: string) {
  if (language === "c") {
    return cKeywords;
  }

  if (language === "cpp") {
    return cppKeywords;
  }

  if (language === "luna") {
    return lunaKeywords;
  }

  if (language === "python") {
    return pythonKeywords;
  }

  if (language === "lir") {
    return lirKeywords;
  }

  return new Set<string>();
}

function isIdentifierStart(character: string) {
  return /[A-Za-z_]/.test(character);
}

function isIdentifierPart(character: string) {
  return /[A-Za-z0-9_]/.test(character);
}

function push(tokens: Token[], kind: TokenKind, text: string) {
  if (!text) {
    return;
  }

  const previous = tokens.at(-1);

  if (previous?.kind === kind) {
    previous.text += text;
    return;
  }

  tokens.push({ kind, text });
}

function tokenizeLine(
  line: string,
  language: string,
  state: LexerState,
): Token[] {
  const tokens: Token[] = [];
  const keywords = languageKeywords(language);
  const supportsCComments = ["c", "cpp", "luna", "lir"].includes(language);
  const hashComments = ["python", "cmake", "yaml", "shell"].includes(language);
  let index = 0;

  while (index < line.length) {
    if (state.blockComment) {
      const commentEnd = line.indexOf("*/", index);

      if (commentEnd === -1) {
        push(tokens, "comment", line.slice(index));
        return tokens;
      }

      push(tokens, "comment", line.slice(index, commentEnd + 2));
      state.blockComment = false;
      index = commentEnd + 2;
      continue;
    }

    if (supportsCComments && line.startsWith("//", index)) {
      push(tokens, "comment", line.slice(index));
      return tokens;
    }

    if (supportsCComments && line.startsWith("/*", index)) {
      const commentEnd = line.indexOf("*/", index + 2);

      if (commentEnd === -1) {
        state.blockComment = true;
        push(tokens, "comment", line.slice(index));
        return tokens;
      }

      push(tokens, "comment", line.slice(index, commentEnd + 2));
      index = commentEnd + 2;
      continue;
    }

    if (hashComments && line[index] === "#") {
      push(tokens, "comment", line.slice(index));
      return tokens;
    }

    if (
      ["c", "cpp"].includes(language) &&
      line[index] === "#" &&
      line.slice(0, index).trim().length === 0
    ) {
      const directive = line.slice(index).match(/^#[ \t]*[A-Za-z_][A-Za-z0-9_]*/);
      const value = directive?.[0] ?? "#";
      push(tokens, "directive", value);
      index += value.length;
      continue;
    }

    const character = line[index];

    if (character === '"' || character === "'") {
      const quote = character;
      let end = index + 1;

      while (end < line.length) {
        if (line[end] === "\\") {
          end += 2;
          continue;
        }

        end += 1;
        if (line[end - 1] === quote) {
          break;
        }
      }

      push(tokens, "string", line.slice(index, end));
      index = end;
      continue;
    }

    if (
      (language === "lir" && ["%", "@", "$"].includes(character)) ||
      (language === "cmake" && line.startsWith("${", index))
    ) {
      let end = index + 1;

      if (language === "cmake") {
        end = line.indexOf("}", index + 2);
        end = end === -1 ? line.length : end + 1;
      } else {
        while (end < line.length && isIdentifierPart(line[end])) {
          end += 1;
        }
      }

      push(tokens, "variable", line.slice(index, end));
      index = end;
      continue;
    }

    const number = line.slice(index).match(
      /^(?:0[xX][0-9A-Fa-f](?:_?[0-9A-Fa-f])*|0[bB][01](?:_?[01])*|(?:\d(?:_?\d)*)?(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?)(?:[uUlLfF]+)?/,
    )?.[0];

    if (number && /\d/.test(number)) {
      push(tokens, "number", number);
      index += number.length;
      continue;
    }

    if (isIdentifierStart(character)) {
      let end = index + 1;

      while (end < line.length && isIdentifierPart(line[end])) {
        end += 1;
      }

      const identifier = line.slice(index, end);
      const nextCharacter = line.slice(end).trimStart()[0];
      let kind: TokenKind = "plain";

      if (languageTypes.has(identifier)) {
        kind = "type";
      } else if (keywords.has(identifier)) {
        kind = "keyword";
      } else if (/^[A-Z][A-Z0-9_]+$/.test(identifier)) {
        kind = "variable";
      } else if (nextCharacter === "(") {
        kind = "function";
      }

      push(tokens, kind, identifier);
      index = end;
      continue;
    }

    if (operatorCharacters.has(character)) {
      push(tokens, "operator", character);
      index += 1;
      continue;
    }

    push(tokens, "plain", character);
    index += 1;
  }

  return tokens;
}

type CodeBlockProps = {
  code: string;
  language?: string;
  compact?: boolean;
  wrap?: boolean;
  anchorLines?: boolean;
  ariaLabel?: string;
};

export function CodeBlock({
  code,
  language = "text",
  compact = false,
  wrap = false,
  anchorLines = false,
  ariaLabel = "代码",
}: CodeBlockProps) {
  const lines = code.replace(/\r\n?/g, "\n").split("\n");
  const state: LexerState = { blockComment: false };

  if (lines.at(-1) === "") {
    lines.pop();
  }

  return (
    <div
      className={[
        "code-block",
        compact ? "code-block-compact" : "",
        wrap ? "code-block-wrap" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <pre>
        <code>
          {lines.map((line, lineIndex) => {
            const lineNumber = lineIndex + 1;
            const tokens = tokenizeLine(line, language, state);

            return (
              <span
                className="code-line"
                id={anchorLines ? `L${lineNumber}` : undefined}
                key={lineNumber}
              >
                {anchorLines ? (
                  <a
                    className="code-line-number"
                    href={`#L${lineNumber}`}
                    aria-label={`第 ${lineNumber} 行`}
                  >
                    {lineNumber}
                  </a>
                ) : (
                  <span className="code-line-number" aria-hidden="true">
                    {lineNumber}
                  </span>
                )}
                <span className="code-line-content">
                  {tokens.length === 0 ? (
                    <Fragment>&#8203;</Fragment>
                  ) : (
                    tokens.map((token, tokenIndex) => (
                      <span
                        className={`tok tok-${token.kind}`}
                        key={`${lineNumber}-${tokenIndex}`}
                      >
                        {token.text}
                      </span>
                    ))
                  )}
                </span>
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

