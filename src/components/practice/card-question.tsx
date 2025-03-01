import React, { useState } from 'react';
import { BookOpen, Pencil } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  question: {
    question_id: string;
    question_text: string;
    options: {
      [key: string]: string;
    };
    correct_answer: string;
    explanation: string;
  };
  onSelectAnswer: (questionId: string, answer: string) => void;
  selectedAnswer?: string;
}

const QuestionCard = ({
  questionNumber,
  question,
  onSelectAnswer,
  selectedAnswer,
}: QuestionCardProps) => {
  const [showHint, setShowHint] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  return (
    <div className="bg-[var(--color-background)] rounded-xl p-8 shadow-sm">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <span className="text-2xl font-medium text-[var(--color-text-secondary)] mr-6">
              {questionNumber}.
            </span>
            <p className="text-xl text-[var(--color-text)]">
              {question.question_text}
            </p>
          </div>
          <div className="flex space-x-3 ml-6">
            <button
              onClick={() => setShowHint(!showHint)}
              className="p-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--color-background-alt)]"
              title="Show hint"
            >
              <BookOpen size={24} />
            </button>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="p-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--color-background-alt)]"
              title="Add note"
            >
              <Pencil size={24} />
            </button>
          </div>
        </div>

        {showHint && (
          <div className="ml-10 p-6 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
            <h4 className="text-xl font-medium mb-3 text-[var(--color-text)]">
              Hint
            </h4>
            <p className="text-lg text-[var(--color-text-secondary)]">
              {question.explanation}
            </p>
          </div>
        )}

        {showNoteInput && (
          <div className="ml-10 p-6 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
            <h4 className="text-xl font-medium mb-3 text-[var(--color-text)]">
              Notes
            </h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
                className={`w-full text-left p-5 rounded-lg border text-lg transition-colors ${
                  selectedAnswer === key
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10'
                    : 'border-[var(--color-gray-200)] hover:border-[var(--color-primary)] hover:bg-[var(--color-background-alt)]'
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
