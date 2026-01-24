import React, { useRef } from "react";

export function MobileTypingFocus({
  inputRef,
  className,
  enabled = true,
  onKeyDown,
  children,
}: {
  inputRef:React.RefObject<HTMLInputElement | null>
  className:string;
  enabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTextInput?: (text: string) => void; // for mobile reliability
  children: React.ReactNode;
}) {

  const blur = () => {
    if (!enabled) return;
    console.log("blur");
    inputRef.current?.blur();
  };

  return (
      <div
      className={className}
      onPointerDownCapture={(e) => {
        e.preventDefault();
        blur();
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
