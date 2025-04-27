export interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  isPinned: boolean;
  timestamp: string;
  parentId: number | null;
}

export interface PostState {
  posts: Post[];
  postInput: string;
  fetchPosts: () => Promise<void>;
  setPostInput: (input: string) => void;
  addPost: (
    parentId: number | null,
    content: string,
    title?: string
  ) => Promise<void>;
}

export interface DiscussionModeratorState {
  isModerator: boolean;
  toggleModerator: () => void;
}
