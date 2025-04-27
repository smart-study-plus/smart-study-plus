'use client';

import { RouteGuard } from '@/components/auth/route-guard';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Gavel, Pin, ShieldBan } from 'lucide-react';
// import DOMPurify from 'dompurify'; // TODO!!!!!!!!! do NOT run without this in production
import { Post } from '@/interfaces/discussion';
import useAppStore from '@/stores/app-store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostModal from '@/components/discussion/create-modal';
import { addPost, deletePost } from '@/app/discussions/actions';
import PostCard, { PostType } from '@/components/discussion/post-card';

interface DiscussionPostProps {
  parentPost: Post;
  posts: Post[];
}

export default function DiscussionPost({
  parentPost,
  posts,
}: DiscussionPostProps) {
  const {
    setParentPost,
    setPosts,
    postInput,
    setPostInput,
    isModerator,
    toggleModerator,
    username,
    isAuthenticated,
  } = useAppStore();

  console.log(username, isAuthenticated, isModerator);

  useEffect(() => {
    setParentPost(parentPost);
    setPosts(posts);
  }, [parentPost, posts, username, isAuthenticated, setParentPost, setPosts]);

  const [newPostTitle, setNewPostTitle] = useState('');

  const router = useRouter();

  const childPosts = posts.filter((post) => post.parentId === parentPost.id);

  const handleAddPost = async () => {
    if (!postInput.trim()) return;
    if (!isAuthenticated) return;
    try {
      const date = new Date();

      const postData: Post = {
        title: `Re: ${parentPost.title}`,
        author: username || 'Anonymous',
        content: postInput,
        isPinned: false,
        timestamp: date.toISOString(),
        parentId: parentPost.id,
      };

      await addPost(postData);
      setPostInput('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const handleDeletePost = async (postId: number | undefined) => {
    if (!isAuthenticated || !isModerator) return;
    if (!postId) return;

    try {
      await deletePost(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <RouteGuard requireAuth>
      <Header />
      <main className="container mx-auto px-4 my-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="font-bold text-3xl text-gray-900">
              {parentPost.title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="flex items-center space-x-2 hover:bg-blue-50"
              onClick={() => router.push('/discussions')}
            >
              <span>Back</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-2 mt-6">
          <PostCard
            post={parentPost}
            isModerator={isModerator}
            postType={PostType.Parent}
            handleDeletePost={handleDeletePost}
          />

          {childPosts.map((post) => (
            <div
              key={post.id}
              className="w-full mx-auto my-4 bg-white rounded-md shadow-md border-b border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <PostCard
                post={post}
                isModerator={isModerator}
                postType={PostType.Child}
                handleDeletePost={handleDeletePost}
              />
            </div>
          ))}

          <PostModal
            postInput={postInput}
            postTitle={newPostTitle}
            isReply={true}
            setPostInput={setPostInput}
            setPostTitle={setNewPostTitle}
            handleAddPost={handleAddPost}
          />
        </div>
      </main>

      <div className="container mx-auto">
        <Button
          variant="outline"
          className="fixed bottom-4 left-4 min-h-4 hover:bg-red-500 hover:text-white"
          onClick={toggleModerator}
        >
          {isModerator ? (
            <ShieldBan className="w-3.5 h-3.5" />
          ) : (
            <Gavel className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </RouteGuard>
  );
}
