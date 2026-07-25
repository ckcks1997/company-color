import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))

export default useLoadingStore
