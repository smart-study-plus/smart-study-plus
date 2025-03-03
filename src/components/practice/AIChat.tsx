import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const parseMarkdown = (text: string): string => {
  if (!text) return '';

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

interface AIChatProps {
  userId: string;
  testId: string;
  questionId: string;
  isVisible: boolean;
  onToggle: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  userId,
  testId,
  questionId,
  isVisible,
  onToggle,
}) => {
  const [userMessage, setUserMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      void loadChatHistory();
    }
  }, [isVisible, userId, testId, questionId]);

  const loadChatHistory = async (): Promise<void> => {
    setLoadingHistory(true);
    setError(null);
    try {
      const response = await fetchWithAuth(
        'http://localhost:8000/api/rag/chat-history',
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

      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      setChatHistory(data.chat_history || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error loading chat history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!userMessage.trim()) return;

    setLoading(true);
    setError(null);
    const messageToSend = userMessage;
    setUserMessage('');

    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: messageToSend },
    ];
    setChatHistory(updatedHistory);

    try {
      const response = await fetchWithAuth(
        'http://localhost:8000/api/rag/answer-chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            test_id: testId,
            question_id: questionId,
            user_message: messageToSend,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Error: ' + errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUserMessage(e.target.value);
  };

  if (!isVisible) return null;

  return (
    <MathJaxContext>
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">AI Tutor Chat</h4>
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-2 px-3 py-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          >
            <X className="w-5 h-5" />
            Close
          </button>
        </div>
        <div className="bg-[var(--color-background-alt)] rounded-lg p-4 mb-4">
          <div className="h-64 overflow-y-auto mb-4 space-y-3">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading chat history...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : chatHistory.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] text-center py-4">
                Start a conversation about this question
              </p>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-white'
                    }`}
                  >
                    <p className="text-md whitespace-pre-wrap break-words">
                      <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
                      <MathJax
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdown(msg.content),
                        }}
                      />
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded bg-white"
              placeholder="Ask a question about this topic..."
              value={userMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading || loadingHistory}
            />
            <button
              onClick={() => void handleSendMessage()}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              disabled={loading || loadingHistory || !userMessage.trim()}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
};
