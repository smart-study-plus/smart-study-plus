'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PostModalProps {
  postInput: string;
  isReply: boolean;
  setPostInput: (input: string) => void;
  postTitle: string;
  setPostTitle: (title: string) => void;
  handleAddPost: () => void;
}

export default function PostModal({
  postInput,
  postTitle,
  isReply,
  setPostInput,
  setPostTitle,
  handleAddPost,
}: PostModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <div className="my-4">
      <Button
        onKeyDown={(e) => e.key === 'Escape' && toggleModal()}
        variant="outline"
        onClick={toggleModal}
      >
        {isReply ? 'Reply' : 'New Discussion'}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 scale-100">
            <Button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={toggleModal}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex flex-col space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {isReply ? 'Reply to Discussion' : 'New Discussion'}
              </h2>
              {!isReply && (
                <textarea
                  className="w-full p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  rows={1}
                  placeholder="Title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              )}

              <textarea
                className="w-full p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                rows={3}
                placeholder="Type here..."
                value={postInput}
                onChange={(e) => setPostInput(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  className="transition-colors duration-200"
                  onClick={() => {
                    handleAddPost();
                    toggleModal();
                  }}
                >
                  Submit Reply
                </Button>
                <Link href="https://www.markdownguide.org/basic-syntax/">
                  <p className="text-xs text-[var(--color-primary)] hover:text-purple-600">
                    Markdown Guide
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
