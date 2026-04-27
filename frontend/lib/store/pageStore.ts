import { create } from 'zustand'

interface PageState {
  previousLocation: string | null
  setPreviousLocation: (location: string) => void
  clearPreviousLocation: () => void
}

const usePageStore = create<PageState>((set) => ({
  previousLocation: null,
  setPreviousLocation: (location) => set({ previousLocation: location }),
  clearPreviousLocation: () => set({ previousLocation: null }),
}))

export default usePageStore
