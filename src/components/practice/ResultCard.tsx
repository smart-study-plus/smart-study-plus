import React, { useState } from 'react';
import { CheckCircle2, XCircle, MessageCircle, X } from 'lucide-react';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';

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
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    setLoading(true);
    const messageToSend = userMessage;
    setUserMessage('');

    const updatedHistory = [
      ...chatHistory,
      { role: 'user', content: messageToSend },
    ];
    setChatHistory(updatedHistory);

    try {
      const response = await fetchWithAuth(
        'http://localhost:8000/api/rag/answer-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Error fetching response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

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

        {showChat && (
          <div className="mt-6 border-t pt-6">
            <h4 className="text-lg font-medium mb-4">AI Tutor Chat</h4>
            <div className="bg-[var(--color-background-alt)] rounded-lg p-4 mb-4">
              <div className="h-64 overflow-y-auto mb-4 space-y-3">
                {chatHistory.length === 0 ? (
                  <p className="text-[var(--color-text-secondary)] text-center py-4">
                    Start a conversation about this question
                  </p>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-[var(--color-primary)] text-white ml-12'
                          : 'bg-white mr-12'
                      }`}
                    >
                      <p className="text-sm">
                        <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
                        {msg.content}
                      </p>
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
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                  disabled={loading || !userMessage.trim()}
                >
                  {loading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
