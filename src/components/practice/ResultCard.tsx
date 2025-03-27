import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  MessageCircle,
  X,
  BookOpen,
  LightbulbIcon,
} from 'lucide-react';
import { AIChat } from './AIChat';
import { MathJax } from 'better-react-mathjax';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface ResultCardProps {
  questionNumber: number;
  isCorrect: boolean;
  userAnswer: string;
  userAnswerText?: string;
  correctAnswer?: string;
  explanation: string;
  userId: string;
  testId: string;
  questionId: string;
  questionType?: string;
  question?: string;
  sourcePage?: number;
  sourceText?: string;
  reference_part?: string;
  feedback?: string;
}

// Helper function to render with KaTeX
const renderWithKatex = (
  text: string,
  displayMode: boolean = false
): string => {
  try {
    return katex.renderToString(text, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch (error) {
    console.error('KaTeX rendering error:', error);
    return text;
  }
};

// Helper function to determine if text is simple LaTeX
const isSimpleLatex = (text: string): boolean => {
  // Check if text contains only basic LaTeX commands and symbols
  const simpleLatexPattern = /^[a-zA-Z0-9\s\+\-\*\/\^\{\}\(\)\[\]\_\$\\]+$/;
  return simpleLatexPattern.test(text);
};

// Helper function to render text with LaTeX
const renderTextWithLatex = (text: string) => {
  if (!text) return null;

  // First, unescape all double backslashes
  let processedText = text.replace(/\\\\/g, '\\');

  // Handle special LaTeX commands and symbols
  processedText = processedText
    // Handle \mathbb{R} notation
    .replace(/\\mathbb\{([^}]+)\}/g, (_, p1) => `\\mathbb{${p1}}`)
    // Handle subscripts and superscripts with multiple characters
    .replace(/_{([^}]+)}/g, '_{$1}')
    .replace(/\^{([^}]+)}/g, '^{$1}')
    // Handle special spacing around operators
    .replace(/\\sum(?![a-zA-Z])/g, '\\sum\\limits')
    .replace(/\\int(?![a-zA-Z])/g, '\\int\\limits')
    .replace(/\\prod(?![a-zA-Z])/g, '\\prod\\limits')
    // Handle spacing around vertical bars and other delimiters
    .replace(/\|/g, '\\,|\\,')
    .replace(/\\mid/g, '\\,|\\,')
    // Handle matrix transpose
    .replace(/\\T(?![a-zA-Z])/g, '^{\\intercal}')
    // Handle common statistical notation
    .replace(/\\Var/g, '\\operatorname{Var}')
    .replace(/\\Bias/g, '\\operatorname{Bias}')
    .replace(/\\MSE/g, '\\operatorname{MSE}')
    .replace(/\\EPE/g, '\\operatorname{EPE}')
    // Handle escaped curly braces
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}');

  // Split text by existing LaTeX delimiters while preserving the delimiters
  const parts = processedText.split(
    /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$|\\\([^)]*?\\\)|\\\[[\s\S]*?\\\])/g
  );

  // Generate a unique key for each part
  const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36); // Convert to base-36 for shorter strings
  };

  return parts.map((part, index) => {
    // Generate a more unique key using content hash
    const key = `${index}-${hashString(part)}`;

    if (
      part.startsWith('$') ||
      part.startsWith('\\(') ||
      part.startsWith('\\[')
    ) {
      // Remove the delimiters
      let latex = part
        .replace(/^\$\$|\$\$$|^\$|\$$|^\\\(|\\\)$|^\\\[|\\\]$/g, '')
        .trim();

      const isDisplay = part.startsWith('$$') || part.startsWith('\\[');

      // Use KaTeX for simple expressions and MathJax for complex ones
      if (isSimpleLatex(latex)) {
        return (
          <span
            key={key}
            dangerouslySetInnerHTML={{
              __html: renderWithKatex(latex, isDisplay),
            }}
          />
        );
      }

      // Wrap the LaTeX in appropriate delimiters for MathJax
      latex = isDisplay ? `$$${latex}$$` : `$${latex}$`;

      return (
        <MathJax key={key} inline={!isDisplay} dynamic={true}>
          {latex}
        </MathJax>
      );
    }

    // Check if the part contains any LaTeX-like content
    if (part.includes('\\') || /[_^{}]/.test(part)) {
      // Check if it needs to be wrapped in delimiters
      let latex = part;

      // For non-delimited LaTeX content, wrap it in $ delimiters
      if (
        !part.startsWith('$') &&
        !part.startsWith('\\(') &&
        !part.startsWith('\\[')
      ) {
        latex = `$${part}$`;
      }

      // Use KaTeX for simple expressions
      if (isSimpleLatex(part)) {
        return (
          <span
            key={key}
            dangerouslySetInnerHTML={{
              __html: renderWithKatex(part, false),
            }}
          />
        );
      }

      // Use MathJax for complex expressions
      return (
        <MathJax key={key} inline={true} dynamic={true}>
          {latex}
        </MathJax>
      );
    }

    return <span key={key}>{part}</span>;
  });
};

export const ResultCard = ({
  questionNumber,
  isCorrect,
  userAnswer,
  userAnswerText,
  correctAnswer,
  explanation,
  userId,
  testId,
  questionId,
  questionType = 'multiple_choice',
  question,
  sourcePage,
  sourceText,
  reference_part,
  feedback,
}: ResultCardProps) => {
  const [showChat, setShowChat] = useState(false);

  // Determine which answer to display based on question type
  const displayUserAnswer =
    questionType === 'short_answer'
      ? userAnswerText || 'No answer provided'
      : `${userAnswer}` || 'No answer provided';

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

            {question && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xl text-gray-800">
                  {renderTextWithLatex(question)}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* User's Answer Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xl text-[var(--color-text-secondary)]">
                    Your Answer:
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Needs Improvement'}
                  </span>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? 'bg-green-50 border border-green-100'
                      : 'bg-red-50 border border-red-100'
                  }`}
                >
                  <p
                    className={`text-xl font-medium ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {renderTextWithLatex(displayUserAnswer)}
                  </p>
                </div>
              </div>

              {/* Ideal/Correct Answer Section */}
              {(questionType === 'short_answer' || !isCorrect) &&
                correctAnswer && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-xl text-[var(--color-text-secondary)]">
                        {questionType === 'short_answer'
                          ? 'Ideal Answer:'
                          : 'Correct Answer:'}
                      </p>
                      {questionType === 'short_answer' && (
                        <LightbulbIcon className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                      <p className="text-xl font-medium text-green-600">
                        {renderTextWithLatex(correctAnswer)}
                      </p>
                    </div>
                  </div>
                )}

              {/* Feedback Section for Short Answers */}
              {questionType === 'short_answer' && feedback && (
                <div>
                  <p className="text-xl text-amber-700 mb-3">Feedback:</p>
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-lg text-amber-800">
                      {renderTextWithLatex(feedback)}
                    </p>

                    {/* Key Points */}
                    {reference_part && (
                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <p className="text-md font-semibold text-amber-800 mb-2">
                          Key{' '}
                          {reference_part.includes(',') ? 'points' : 'point'} to
                          include:
                        </p>
                        <p className="text-md text-amber-700 italic">
                          &quot;{renderTextWithLatex(reference_part)}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Source Reference Section */}
              {questionType === 'short_answer' && sourceText && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xl text-blue-700">Source Reference:</p>
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    {sourcePage && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                        Page {sourcePage}
                      </span>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <blockquote className="text-lg text-blue-800 border-l-4 border-blue-300 pl-4 italic">
                      {renderTextWithLatex(sourceText)}
                    </blockquote>
                  </div>
                </div>
              )}

              {/* Explanation Section - Only for Multiple Choice */}
              {questionType !== 'short_answer' && explanation && (
                <div>
                  <p className="text-xl text-[var(--color-text-secondary)] mb-3">
                    Explanation:
                  </p>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-lg text-[var(--color-text)]">
                      {renderTextWithLatex(explanation)}
                    </div>
                  </div>
                </div>
              )}
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

        {showChat && (
          <AIChat userId={userId} testId={testId} questionId={questionId} />
        )}
      </div>
    </div>
  );
};
