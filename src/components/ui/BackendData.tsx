import type { ReactNode } from "react";

type BackendDataProps = {
  value?: string | number | null;
  className?: string;
  children?: ReactNode;
};

const isRtlContent = (text: string) => /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text);

const BackendData = ({ value, className = "", children }: BackendDataProps) => {
  const content = value != null ? String(value) : children;
  const text = typeof content === "string" ? content : "";
  const dir = text ? (isRtlContent(text) ? "rtl" : "ltr") : "ltr";

  return (
    <span
      dir={dir}
      style={{
        unicodeBidi: "plaintext",
        direction: dir,
        textAlign: dir === "rtl" ? "right" : "left",
        display: "inline-block",
      }}
      className={className}
    >
      {content}
    </span>
  );
};

export default BackendData;
