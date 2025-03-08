import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { X, Loader2, MessageSquare } from 'lucide-react';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  userId: string;
  testId: string;
  questionId: string;
}

export const AIChat: React.FC<AIChatProps> = ({
  userId,
  testId,
  questionId,
}) => {
  const [userMessage, setUserMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      void loadChatHistory();
    }
  }, [isOpen, userId, testId, questionId]);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] w-[90vw] bg-white">
        <DialogHeader>
          <DialogTitle>AI Tutor Chat</DialogTitle>
        </DialogHeader>
        <div className="bg-white rounded-lg p-4">
          <div className="h-[500px] overflow-y-auto mb-4 space-y-3">
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
                    <div className="text-md whitespace-pre-wrap break-words">
                      <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {formatMathNotation(msg.content)}
                      </ReactMarkdown>
                    </div>
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
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && !e.shiftKey && void handleSendMessage()
              }
              disabled={loading || loadingHistory}
            />
            <Button
              onClick={() => void handleSendMessage()}
              disabled={loading || loadingHistory || !userMessage.trim()}
            >
              {loading ? '...' : 'Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
