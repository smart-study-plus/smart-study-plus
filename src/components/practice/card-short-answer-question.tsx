import React, { useState } from 'react';
import { BookOpen, Pencil } from 'lucide-react';
import { HintSection } from './HintSection';
import { Textarea } from '@/components/ui/textarea';

interface ShortAnswerQuestionProps {
  questionNumber: number;
  question: {
    question_id: string;
    question_text: string;
    ideal_answer: string;
    source_page?: number;
    source_text?: string;
  };
  onAnswerChange: (questionId: string, text: string) => void;
  answerText: string;
  note: string;
  onUpdateNote: (questionId: string, newNote: string) => void;
  userId: string;
  testId: string;
}

const ShortAnswerQuestionCard: React.FC<ShortAnswerQuestionProps> = ({
  questionNumber,
  question,
  onAnswerChange,
  answerText,
  note,
  onUpdateNote,
  userId,
  testId,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAnswerChange(question.question_id, e.target.value);
  };

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

        {question.source_text && (
          <div className="ml-10 p-4 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
            <p className="text-sm text-[var(--color-text-muted)] italic">
              &ldquo;{question.source_text}&rdquo;
            </p>
          </div>
        )}

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
          <div className="w-full">
            <h4 className="text-lg font-medium mb-2 text-[var(--color-text)]">
              Your Answer:
            </h4>
            <Textarea
              className="w-full p-4 text-lg rounded-lg border border-[var(--color-gray-200)] focus:border-[var(--color-primary)] focus:outline-none min-h-[120px]"
              placeholder="Type your answer here..."
              value={answerText}
              onChange={handleAnswerChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortAnswerQuestionCard;
