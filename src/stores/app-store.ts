import { Auth } from '@/interfaces/auth';
import {
  DiscussionModeratorState,
  PostState,
  ParentPostState,
} from '@/interfaces/discussion';
import { create } from 'zustand';

interface AppState
  extends ParentPostState,
    PostState,
    DiscussionModeratorState,
    Auth {}

const createParentPostSlice = (set: any): ParentPostState => ({
  parentPost: null,
  setParentPost: (post) => set({ parentPost: post }),
  pinPost: () =>
    set((state: AppState) => ({
      parentPost: state.parentPost
        ? { ...state.parentPost, isPinned: !state.parentPost.isPinned }
        : null,
    })),
});

const createPostSlice = (set: any): PostState => ({
  posts: [],
  postInput: '',
  setPosts: (posts) => set({ posts }),
  setPostInput: (input) => set({ postInput: input }),
});

const createModeratorSlice = (set: any): DiscussionModeratorState => ({
  isModerator: false,
  toggleModerator: () =>
    set((state: AppState) => ({ isModerator: !state.isModerator })),
});

const createAuthSlice = (set: any): Auth => ({
  username: null,
  isAuthenticated: false,
  userMetadata: null,
  setAuth: () =>
    set((state: AppState) => ({
      username: state.username,
      isAuthenticated: state.isAuthenticated,
      userMetadata: state.userMetadata,
    })),
});

const useAppStore = create<AppState>((set) => ({
  ...createParentPostSlice(set),
  ...createPostSlice(set),
  ...createModeratorSlice(set),
  ...createAuthSlice(set),
}));

export default useAppStore;
