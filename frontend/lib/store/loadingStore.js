import { create } from 'zustand'

const useLoadingStore = create((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading })
}))

export default useLoadingStore