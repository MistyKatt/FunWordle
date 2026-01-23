import React from "react";
import { AnswerDTO } from "../lib/types";


export function GameFooter({
  isFinished,
  answer,
}: {
  isFinished: boolean;
  answer?: AnswerDTO | null;
}) {
  if (!isFinished) return null;

  return (
    <div className="game-footer space-y-4">
      <p className="text-lg font-semibold text-red-600">
        Game is finished. The answer is{" "}
        <span className="underline">{answer?.answer}</span>
        <br />
        Start a new one to play again.
      </p>

      {answer?.explanation && (
        <div className="rounded-md border bg-gray-50 p-4">
          <h3 className="text-md font-semibold mb-2">
            Meaning of “{answer.explanation.word}”
            {answer.explanation.phonetic && (
              <span className="ml-2 text-sm text-gray-500">
                {answer.explanation.phonetic}
              </span>
            )}
          </h3>

          <div className="max-h-48 overflow-y-auto pr-2 space-y-3">
            {answer.explanation.meanings.map((meaning, idx) => (
              <div key={idx}>
                <div className="font-medium italic text-gray-700">
                  {meaning.partOfSpeech}
                </div>
                <ul className="list-disc list-inside text-sm text-gray-800">
                  {meaning.definitions.map((def, dIdx) => (
                    <li key={dIdx}>{def.definition}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
