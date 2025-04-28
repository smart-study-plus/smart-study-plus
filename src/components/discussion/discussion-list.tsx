'use client';

import Link from 'next/link';
import useAppStore from '@/stores/app-store';
import { useEffect, useState } from 'react';
import { Post } from '@/interfaces/discussion';
import PostModal from '@/components/discussion/create-modal';
import { addPost } from '@/app/discussions/actions';
import PostCard, { PostType } from '@/components/discussion/post-card';

interface DiscussionListProps {
  posts: Post[];
}

export default function DiscussionListing({ posts }: DiscussionListProps) {
  const { setPosts, isModerator, toggleModerator, username, isAuthenticated } =
    useAppStore();
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setnewPostContent] = useState('');

  useEffect(() => {
    setPosts(posts);
  }, [posts, username, isAuthenticated, setPosts]);

  const handleAddPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (!isAuthenticated) return;
    try {
      const date = new Date();

      const postData: Post = {
        title: newPostTitle,
        author: username || 'Anonymous',
        content: newPostContent,
        isPinned: false,
        timestamp: date.toISOString(),
      };

      await addPost(postData);
      setNewPostTitle('');
      setnewPostContent('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  return (
    <main>
      <div className="container mx-auto sm:px-6 lg:px-8 py-8">
        <PostModal
          postInput={newPostContent}
          postTitle={newPostTitle}
          isReply={false}
          setPostInput={setnewPostContent}
          setPostTitle={setNewPostTitle}
          handleAddPost={handleAddPost}
        />

        <div className="flex flex-col space-y-2">
          {posts.map((post) => (
            <Link href={`/discussions/${post.id}`} key={post.id}>
              <PostCard
                post={post}
                isModerator={false}
                postType={PostType.Listing}
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
