import { createClient } from '@/utils/supabase/server';
import DiscussionListing from '@/components/discussion/discussion-list';
import { Post } from '@/interfaces/discussion';
import { Header } from '@/components/layout/header';
import { RouteGuard } from '@/components/auth/route-guard';
import { getDiscussions } from '@/app/discussions/actions';

export default async function Discussions() {
  const posts = await getDiscussions();
  // sort by pinned first
  posts.sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

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
