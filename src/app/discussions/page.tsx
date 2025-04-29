import { createClient } from '@/utils/supabase/server';
import DiscussionListing from '@/components/discussion/discussion-list';
import { Post } from '@/interfaces/discussion';
import { Header } from '@/components/layout/header';
import { RouteGuard } from '@/components/auth/route-guard';
import { getDiscussions } from '@/app/discussions/actions';

export default async function Discussions() {
  const posts = await getDiscussions();

  if (posts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1>No discussions found.</h1>
        <p>Why not start one?</p>
      </div>
    );

  // sort by pinned first, then reverse id
  posts.sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    // satisfy the linter gods
    const aId = a.id ?? 0;
    const bId = b.id ?? 0;

    return bId - aId;
  });

  return (
    <RouteGuard requireAuth>
      <Header />
      <div className="bg-linear-to-r bg-gradient-to-r from-[var(--color-primary)] to-purple-600 justify-center text-center h-36">
        <h1 className="text-4xl font-extrabold p-6 text-white">Discussions</h1>
        <p className="text-md text-white">
          Discuss anything related to the courses, or provide platform feedback.
        </p>
      </div>
      <DiscussionListing posts={posts} />
      <div className="mt-10"></div>
    </RouteGuard>
  );
}
