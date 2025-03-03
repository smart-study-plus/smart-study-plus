import React, { useState } from 'react';
import { CheckCircle2, XCircle, MessageCircle, X } from 'lucide-react';
import { AIChat } from './AIChat';

interface ResultCardProps {
  questionNumber: number;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer?: string;
  explanation: string;
  userId: string;
  testId: string;
  questionId: string;
}

export const ResultCard = ({
  questionNumber,
  isCorrect,
  userAnswer,
  correctAnswer,
  explanation,
  userId,
  testId,
  questionId,
}: ResultCardProps) => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="bg-[var(--color-background)] rounded-xl p-8 shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-6">
          {isCorrect ? (
            <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-medium text-[var(--color-text)] mb-6">
              Question {questionNumber}
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-xl text-[var(--color-text-secondary)] mb-3">
                  Your Answer:
                </p>
                <p
                  className={`text-xl font-medium ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {userAnswer}
                </p>
              </div>
              {!isCorrect && correctAnswer && (
                <div>
                  <p className="text-xl text-[var(--color-text-secondary)] mb-3">
                    Correct Answer:
                  </p>
                  <p className="text-xl font-medium text-green-600">
                    {correctAnswer}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xl text-[var(--color-text-secondary)] mb-3">
                  Explanation:
                </p>
                <p className="text-lg text-[var(--color-text)]">
                  {explanation}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
            >
              {showChat ? (
                <>
                  <X className="w-5 h-5" />
                  Close Chat
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Chat with AI
                </>
              )}
            </button>
          </div>
        </div>

        <AIChat
          userId={userId}
          testId={testId}
          questionId={questionId}
          isVisible={showChat}
          onToggle={() => setShowChat(!showChat)}
        />
      </div>
    </div>
  );
};
