export interface Post {
  id?: number;
  title: string;
  author: string;
  content: string;
  isPinned: boolean;
  timestamp: string;
  parentId?: number;
}

export interface PostState {
  posts: Post[];
  postInput: string;
  setPosts: (posts: Post[]) => void;
  setPostInput: (input: string) => void;
}

export interface DiscussionModeratorState {
  isModerator: boolean;
  toggleModerator: () => void;
}

export interface ParentPostState {
  parentPost: Post | null;
  setParentPost: (post: Post | null) => void;
  pinPost: () => void;
}
