import React, { useRef } from "react";

export function MobileTypingFocus({
  className,
  enabled = true,
  onKeyDown,
  children,
}: {
  className:string;
  enabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTextInput?: (text: string) => void; // for mobile reliability
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const focus = () => {
    if (!enabled) return;
    inputRef.current?.focus();
  };

  return (
      <div
      className={className}
      onPointerDownCapture={(e) => {
        e.preventDefault();
        focus();
      }}
    >
      <input
        ref={inputRef}
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: 1,
          height: 1,
          opacity: 0,
          zIndex: 9999,
        }}
        onKeyDown={(e) => {onKeyDown?.(e)}}
        onChange={(e) => {}}
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
      />
      {children}
    </div>

  );
}
