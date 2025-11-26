'use client';

import React, { useState } from 'react';

export interface RulesPanelProps {
  initiallyOpen?: boolean;
}

export const RulesPanel: React.FC<RulesPanelProps> = ({ initiallyOpen = false }) => {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <div style={{ marginBottom: 16 }}>
      <button type="button" onClick={() => setOpen(!open)}>
        {open ? 'Hide rules' : 'Show rules'}
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #4b5563',
            fontSize: 14,
          }}
        >
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
      )}
    </div>
  );
};
