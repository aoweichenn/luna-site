"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "复制" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button className="copy-button" type="button" onClick={copy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "已复制" : label}
    </button>
  );
}

