import { Auth } from '@/interfaces/auth';
import {
  DiscussionModeratorState,
  PostState,
  ParentPostState,
} from '@/interfaces/discussion';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserMetadata } from '@supabase/supabase-js';

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
  setAuth: (auth: {
    username: string;
    isAuthenticated: boolean;
    userMetadata: UserMetadata;
  }) =>
    set({
      username: auth.username,
      isAuthenticated: auth.isAuthenticated,
      userMetadata: auth.userMetadata,
    }),
  clearAuth: () =>
    set({ username: null, isAuthenticated: false, userMetadata: null }),
});

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...createParentPostSlice(set),
      ...createPostSlice(set),
      ...createModeratorSlice(set),
      ...createAuthSlice(set),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        username: state.username,
        isAuthenticated: state.isAuthenticated,
        userMetadata: state.userMetadata,
      }),
    }
  )
);

export default useAppStore;
