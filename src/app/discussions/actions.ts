'use server';

import { Post } from '@/interfaces/discussion';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getDiscussions(parentId?: number): Promise<Post[]> {
  try {
    const query = parentId !== undefined ? `?parent_id=${parentId}` : '';

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/discussions/posts${query}`
    );
    if (!res.ok) {
      // no posts
      if (res.status === 404) return [];

      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const resJson = await res.json();

    if (resJson.length === 0) return [];

    return resJson.map((apiPost: any) => ({
      id: apiPost.post_id,
      title: apiPost.title,
      content: apiPost.content,
      author: apiPost.author_id,
      isPinned: apiPost.is_pinned,
      timestamp: apiPost.timestamp,
      parentId: apiPost.parent_id,
    }));
  } catch (error) {
    console.error('Failed to fetch discussions:', error);
    throw new Error('Unable to fetch discussion posts');
  }
}

export async function addPost(post: Post) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/discussions/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      }
    );
    if (res.ok) revalidatePath(`/discussions/${post.parentId}`);
  } catch (error) {
    console.error('Failed to add post:', error);
    throw new Error('Unable to add post');
  }
}

export async function deletePost(postId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SSP_API_URL}/api/discussions/posts/${postId}`,
      {
        method: 'DELETE',
      }
    );
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw new Error('Unable to delete post');
  } finally {
    redirect('/discussions/');
  }
}

export async function updatePost(post: Post) {
  // todo: unused
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SSP_API_URL}/api/discussions/posts/${post.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw new Error('Unable to delete post');
  } finally {
    redirect('/discussions/');
  }
}
