import { createClient } from '@/utils/supabase/server';
import DiscussionPost from '@/components/discussion/discussion-post';
import { Post } from '@/interfaces/discussion';
import { Loader2 } from 'lucide-react';
import { getDiscussions } from '@/app/discussions/actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DiscussionView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const postId = parseInt(id, 10);
  const posts = await getDiscussions(postId);

  if (posts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1>Post not found.</h1>
        <Link href="/discussions">Back to Listing</Link>
      </div>
    );

  const parentPost = posts.find((post: Post) => post.id === postId);

  if (parentPost === undefined) redirect('/discussions');

  const { data: userData, error: userError } = await supabase.auth.getUser();

  const childPosts = posts.filter((post: Post) => post.parentId === postId);
  const username = userData?.user?.user_metadata?.display_name || null;
  const isAuthenticated = !!userData?.user;

  return <DiscussionPost parentPost={parentPost} posts={childPosts} />;
}
