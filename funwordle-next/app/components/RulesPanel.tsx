// components/RulesPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface RulesPanelProps {
  initiallyOpen?: boolean;
}

export const RulesPanel: React.FC<RulesPanelProps> = ({ initiallyOpen = false }) => {
  const [open, setOpen] = useState(initiallyOpen);
  const [maxHeight, setMaxHeight] = useState<string>('0px');
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Measure content height for smooth slide
  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      const scrollHeight = contentRef.current.scrollHeight;
      setMaxHeight(`${scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [open]);

  return (
    <div className="rules-container">
      <button
        type="button"
        className="rules-toggle"
        onClick={() => setOpen(!open)}
      >
        <span>Game rules</span>
        <span className="rules-toggle-icon">{open ? '▲' : '▼'}</span>
      </button>

      <div
        className={`rules-panel-outer ${open ? 'rules-open' : 'rules-closed'}`}
        style={{ maxHeight }}
      >
        <div ref={contentRef} className="rules-panel">
          <p>Touch or click input boxes to enable the input. Touch or click anywhere else to disable the input</p>
          <p>Guess the 5-letter word in the allowed number of tries.</p>
          <p>
            After each guess:
            <br />
            • <strong>Green</strong>: correct letter in the correct position.
            <br />
            • <strong>Yellow</strong>: letter exists in the word but in a different position.
            <br />
            • <strong>Gray</strong>: letter is not in the word.
          </p>
        </div>
      </div>
    </div>
  );
};
