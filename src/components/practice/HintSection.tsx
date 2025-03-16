import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { MathJaxContext } from 'better-react-mathjax';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ENDPOINTS } from '@/config/urls';

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
  const [loadingMessage, setLoadingMessage] =
    useState<string>('Loading hint...');
  const [generatingNewHint, setGeneratingNewHint] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const maxRetries = 3;

  // Function to retry fetching a hint that might have been generated
  const retryFetchHint = async () => {
    try {
      // Try to fetch the hint that might have been generated despite the error
      const fetchResponse = await fetchWithAuth(ENDPOINTS.ragFetchHint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          test_id: testId,
          question_id: questionId,
        }),
      });

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        if (data.found) {
          console.log('Successfully retrieved hint on retry!');
          setHint(data.hint);
          setError(null);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error during hint retry:', error);
      return false;
    }
  };

  const handleGetHint = async () => {
    if (hint) return;

    setLoadingHint(true);
    setError(null);

    try {
      // Try fetching existing hint
      const fetchResponse = await fetchWithAuth(ENDPOINTS.ragFetchHint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          test_id: testId,
          question_id: questionId,
        }),
      });

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();

        if (data.found) {
          // Hint exists, set it directly
          setHint(data.hint);
          return;
        } else {
          // Hint not found, show transition message and generate a new one
          setGeneratingNewHint(true);
          setLoadingMessage(
            data.message || 'Creating a personalized hint for you...'
          );
        }
      } else {
        // Handle other API errors
        setGeneratingNewHint(true);
        setLoadingMessage('Crafting a new hint just for you...');
      }

      // If we get here, we need to generate a new hint
      const generateResponse = await fetchWithAuth(ENDPOINTS.ragGenerateHint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          test_id: testId,
          question_id: questionId,
          question_text: questionText,
        }),
      });

      if (!generateResponse.ok) {
        throw new Error(
          'Failed to generate hint, but it might still be processing...'
        );
      }

      const generateData = await generateResponse.json();
      setHint(generateData.hint);
    } catch (error) {
      console.error('Error generating hint:', error);

      // Set a more informative error message but don't show it yet - try to recover first
      setError(
        'Sorry, I had trouble creating your hint. Please wait while I try again...'
      );
      setRetryCount((prev) => prev + 1);

      // Wait a moment before retrying (delay increases with each retry)
      const delay = 1000 * retryCount;
      setLoadingMessage(
        `Retrieving your hint... (attempt ${retryCount + 1}/${maxRetries})`
      );

      setTimeout(async () => {
        // Try to fetch the hint that might have been generated despite the error
        const success = await retryFetchHint();

        if (!success && retryCount < maxRetries - 1) {
          // If still not successful and we have retries left, retry the fetch
          setRetryCount((prev) => prev + 1);
        } else if (!success) {
          // Max retries reached, show final error
          setError(
            'Sorry, I had trouble creating your hint. Please try again later or ask your instructor for help.'
          );
          setLoadingHint(false);
          setGeneratingNewHint(false);
        }
      }, delay);

      return; // Don't reset loading state yet if we're retrying
    }

    // Only reach here if everything went well
    setLoadingHint(false);
    setGeneratingNewHint(false);
    setRetryCount(0);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    handleGetHint();
  };

  React.useEffect(() => {
    if (isVisible && !hint && !loadingHint) {
      handleGetHint();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const formatMathNotation = (text: string): string => {
    if (!text) return '';

    text = text.replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`);

    text = text.replace(
      /\\\[(.*?)\\\]/gm,
      (_, equation) => `\n\n$$${equation}$$\n\n`
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
            <div className="text-lg text-[var(--color-text-secondary)]">
              <p>{loadingMessage}</p>
              {generatingNewHint && (
                <div className="mt-2 flex items-center">
                  <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
                  <div className="animate-pulse delay-200 mr-2 h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
                  <div className="animate-pulse delay-500 h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-lg text-[var(--color-text-secondary)]">
              <p className="text-red-500">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-lg text-[var(--color-text-secondary)]">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {formatMathNotation(hint ?? '')}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
};
