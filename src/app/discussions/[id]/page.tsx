import DiscussionPost from '@/components/discussion/discussion-post';
import { Post } from '@/interfaces/discussion';
import { getDiscussions } from '@/app/discussions/actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DiscussionView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const childPosts = posts.filter((post: Post) => post.parentId === postId);

  return <DiscussionPost parentPost={parentPost} posts={childPosts} />;
}
