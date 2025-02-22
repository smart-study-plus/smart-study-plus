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
    <div className="bg-[var(--color-background)] rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <span className="font-medium text-[var(--color-text-secondary)] mr-4">
              {questionNumber}.
            </span>
            <p className="text-[var(--color-text)]">{question.question_text}</p>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--color-background-alt)]"
              title="Show hint"
            >
              <BookOpen size={20} />
            </button>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--color-background-alt)]"
              title="Add note"
            >
              <Pencil size={20} />
            </button>
          </div>
        </div>

        {showHint && (
          <div className="ml-8 p-4 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
            <h4 className="font-medium mb-2 text-[var(--color-text)]">Hint</h4>
            <p className="text-[var(--color-text-secondary)]">
              {question.explanation}
            </p>
          </div>
        )}

        {showNoteInput && (
          <div className="ml-8 p-4 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
            <h4 className="font-medium mb-2 text-[var(--color-text)]">Notes</h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full p-3 rounded-lg border border-[var(--color-gray-200)] focus:border-[var(--color-primary)] focus:outline-none resize-y min-h-[100px]"
            />
          </div>
        )}

        <div className="ml-8 space-y-3">
          {Object.entries(question.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => onSelectAnswer(question.question_id, key)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedAnswer === key
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10'
                  : 'border-[var(--color-gray-200)] hover:border-[var(--color-primary)] hover:bg-[var(--color-background-alt)]'
              }`}
            >
              <span className="font-medium mr-2">{key}.</span>
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
