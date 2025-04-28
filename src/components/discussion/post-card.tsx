import { Edit, Lock, Pin, Trash2 } from 'lucide-react';
import { Post } from '@/interfaces/discussion';
import useAppStore from '@/stores/app-store';
import { Button } from '../ui/button';
import DOMPurify from 'isomorphic-dompurify';
import ReactMarkdown from 'react-markdown';

export enum PostType {
  Listing,
  Parent,
  Child,
}

interface PostCardProps {
  post: Post;
  isModerator: boolean;
  postType: PostType;
  handleDeletePost?: (postId: number | undefined) => Promise<void>;
}

export default function PostCard({
  post,
  isModerator,
  postType,
  handleDeletePost,
}: PostCardProps) {
  return (
    <div className="w-full mx-auto bg-white rounded-md ring-1/2 drop-shadow-lg hover:shadow-xl transition-shadow duration-200">
      {postType == PostType.Listing && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <span className="font-bold text-xl">
            {DOMPurify.sanitize(post.title)}
          </span>
        </div>
      )}
      <div className="px-3 py-2">
        <ReactMarkdown>{DOMPurify.sanitize(post.content)}</ReactMarkdown>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <span className="font-medium">{DOMPurify.sanitize(post.author)}</span>
          {post.isPinned && (
            <span className="inline-flex items-center bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              <Pin className="w-3 h-3 mr-1" /> Pinned
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
          {isModerator && postType == PostType.Parent && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                className="flex items-center h-3.5 text-gray-500 hover:text-yellow-600 text-xs font-medium"
              >
                <Lock className="mr-1 w-3.5 h-3.5" /> Lock
              </Button>
              <Button
                variant="ghost"
                className="flex items-center h-3.5 text-gray-500 hover:text-yellow-600 text-xs font-medium"
                onClick={useAppStore.getState().pinPost}
              >
                <Pin className="mr-1 w-3.5 h-3.5" /> Pin
              </Button>
            </div>
          )}

          {isModerator && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                className="flex items-center h-3.5 text-gray-500 hover:text-blue-600 text-xs font-medium"
              >
                <Edit className="mr-1 w-3.5 h-3.5" /> Edit
              </Button>
              <Button
                variant="ghost"
                className="flex items-center h-3.5 text-gray-500  hover:text-red-600 text-xs font-medium"
                onClick={async (e) => await handleDeletePost?.(post.id)}
              >
                <Trash2 className="mr-1 w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          )}
          <span className="text-xs text-gray-500">
            {new Date(post.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
