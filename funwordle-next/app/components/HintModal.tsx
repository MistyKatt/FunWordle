import { useEffect } from "react";
import { ExplanationDefinitionDto } from "../lib/types";

type HintModalProps = {
  hint: ExplanationDefinitionDto | null;
  onClose: () => void;
};

export function HintModal({ hint, onClose }: HintModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!hint) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hint, onClose]);

  if (!hint) return null;

  return (
    <div
      className="modal-backdrop"
      onPointerDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card">
        <div className="modal-def">{hint.definition}</div>
        <div className="modal-actions">
          <button type="button" className="modal-ok" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
