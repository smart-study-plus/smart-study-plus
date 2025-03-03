import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface HintSectionProps {
  userId: string;
  testId: string;
  questionId: string;
  questionText: string;
  isVisible: boolean;
  onToggle: () => void;
}

export const HintSection = ({
  userId,
  testId,
  questionId,
  questionText,
  isVisible,
  onToggle,
}: HintSectionProps) => {
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const handleGetHint = async () => {
    if (hint) return; // If hint is already loaded, don't fetch again

    setLoadingHint(true);
    try {
      // First, try fetching existing hint
      const fetchResponse = await fetchWithAuth(
        'http://localhost:8000/api/rag/fetch-hint',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            test_id: testId,
            question_id: questionId,
          }),
        }
      );

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setHint(data.hint);
        return;
      }

      // If not found, generate new hint
      const generateResponse = await fetchWithAuth(
        'http://localhost:8000/api/rag/generate-hint',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            test_id: testId,
            question_id: questionId,
            question_text: questionText,
          }),
        }
      );

      if (!generateResponse.ok) {
        throw new Error('Failed to generate hint');
      }

      const generateData = await generateResponse.json();
      setHint(generateData.hint);
    } catch (error) {
      setHint('❌ Failed to load hint.');
    } finally {
      setLoadingHint(false);
    }
  };

  React.useEffect(() => {
    if (isVisible && !hint && !loadingHint) {
      handleGetHint();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const parseMarkdown = (text: string) => {
    if (!text) return null;

    text = text.replace(/(\d+\.)?\s*\*\*(.*?)\*\*/g, (_, num, content) => {
      return `${num ? `<br><strong>${num} ${content}</strong>` : `<br><strong>${content}</strong>`}`;
    });

    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    text = text.replace(
      /\\\((.*?)\\\)/g,
      (_, equation) => `<MathJax inline>${equation}</MathJax>`
    );

    text = text.replace(
      /\$\$([\s\S]*?)\$\$/gm,
      (_, equation) => `<MathJax>${equation}</MathJax>`
    );

    return text;
  };

  return (
    <MathJaxContext>
      <div className="ml-10 bg-[var(--color-background-alt)] rounded-lg border border-[var(--color-gray-200)]">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-6 text-left border-b border-[var(--color-gray-200)]"
        >
          <h4 className="text-xl font-medium text-[var(--color-text)]">Hint</h4>
          <ChevronDown
            className={`w-5 h-5 text-[var(--color-text-secondary)] transform transition-transform ${
              isVisible ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div className="p-6">
          {loadingHint ? (
            <p className="text-lg text-[var(--color-text-secondary)]">
              Loading hint...
            </p>
          ) : (
            <MathJax>
              <div
                className="text-lg text-[var(--color-text-secondary)]"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(hint ?? '') || '',
                }}
              />
            </MathJax>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
};
