'use client';

import React, { useState } from 'react';
import { BookOpen, Pencil } from 'lucide-react';
import { HintSection } from './HintSection';

interface QuestionCardProps {
  questionNumber: number;
  question: {
    question_id: string;
    question_text: string;
    options: Record<string, string>;
    correct_answer: string;
    explanation: string;
    source_page?: number;
    source_text?: string;
  };
  onSelectAnswer: (questionId: string, answer: string) => void;
  selectedAnswer?: string;
  note: string;
  onUpdateNote: (questionId: string, newNote: string) => void;
  userId: string;
  testId: string;
}

const QuestionCard = ({
  questionNumber,
  question,
  onSelectAnswer,
  selectedAnswer,
  userId,
  testId,
  note,
  onUpdateNote,
}: QuestionCardProps) => {
  const [showHint, setShowHint] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  return (
    <div className="bg-[var(--color-background)] rounded-xl p-8 shadow-lg border-2 border-gray-300">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <span className="text-2xl font-medium text-[var(--color-text-secondary)] mr-6">
              {questionNumber}.
            </span>
            <div className="flex-1">
              <p className="text-xl text-[var(--color-text)] font-medium">
                {question.question_text}
              </p>
              {question.source_page && (
                <span className="text-sm text-[var(--color-text-muted)] mt-1 block">
                  Source: Page {question.source_page}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-3 ml-6">
            <button
              onClick={() => setShowHint(!showHint)}
              className={`p-3 transition-colors rounded-lg ${
                showHint
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-background-alt)]'
              }`}
              title="Show hint"
            >
              <BookOpen size={24} />
            </button>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className={`p-3 transition-colors rounded-lg ${
                showNoteInput
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-background-alt)]'
              }`}
              title="Add note"
            >
              <Pencil size={24} />
            </button>
          </div>
        </div>

        {/* {question.source_text && (
          <div className="ml-10 p-4 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
            <p className="text-sm text-[var(--color-text-muted)] italic">
              "{question.source_text}"
            </p>
          </div>
        )} */}

        <HintSection
          userId={userId}
          testId={testId}
          questionId={question.question_id}
          questionText={question.question_text}
          isVisible={showHint}
          onToggle={() => setShowHint(!showHint)}
        />

        {showNoteInput && (
          <div className="ml-10 p-6 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
            <h4 className="text-xl font-medium mb-3 text-[var(--color-text)]">
              Notes
            </h4>
            <textarea
              value={note}
              onChange={(e) =>
                onUpdateNote(question.question_id, e.target.value)
              }
              placeholder="Write your notes here..."
              className="w-full p-4 text-lg rounded-lg border border-[var(--color-gray-200)] focus:border-[var(--color-primary)] focus:outline-none resize-y min-h-[120px]"
            />
          </div>
        )}

        <div className="ml-10 space-y-4">
          {question?.options &&
            Object.entries(question.options ?? {}).map(([key, value]) => (
              <button
                key={key}
                onClick={() => onSelectAnswer(question.question_id, key)}
                className={`w-full text-left p-5 rounded-lg text-lg transition-colors border-2 ${
                  selectedAnswer === key
                    ? 'border-2 border-gray-400 bg-gray-200 text-gray-900'
                    : 'border-[var(--color-gray-200)] hover:border-gray-400 hover:bg-[var(--color-background-alt)]'
                }`}
              >
                <span className="text-xl font-medium mr-3">{key}.</span>
                {value}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
