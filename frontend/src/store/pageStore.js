import {create} from 'zustand'

const usePageStore = create((set) => ({
  previousLocation: null,
  setPreviousLocation: (location) => set({ previousLocation: location }),
  clearPreviousLocation: () => set({ previousLocation: null }),
}))

export default usePageStore