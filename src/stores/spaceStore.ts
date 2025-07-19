import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Space, CreateSpaceRequest } from '@/types'
import { spaceService } from '@/services/spaceService'

interface SpaceState {
  spaces: Space[]
  currentSpace: Space | null
  loading: boolean
  error: string | null
  
  // Actions
  loadSpaces: (query?: any) => Promise<void>
  loadSpace: (slug: string) => Promise<void>
  createSpace: (data: CreateSpaceRequest) => Promise<Space>
  updateSpace: (slug: string, data: Partial<CreateSpaceRequest>) => Promise<Space>
  deleteSpace: (slug: string) => Promise<void>
  setCurrentSpace: (space: Space | null) => void
  clearError: () => void
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpace: null,
      loading: false,
      error: null,

      loadSpaces: async (query = {}) => {
        set({ loading: true, error: null })
        try {
          const response = await spaceService.getSpaces(query)
          // 从响应中获取spaces数组（注意双层嵌套）
          const spaces = response.data?.data?.spaces || []
          set({ 
            spaces: Array.isArray(spaces) ? spaces : [],
            loading: false 
          })
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.error || error.message || '加载空间失败' 
          })
        }
      },

      loadSpace: async (slug: string) => {
        set({ loading: true, error: null })
        try {
          const response = await spaceService.getSpace(slug)
          set({ 
            currentSpace: response.data, 
            loading: false 
          })
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.error || error.message || '加载空间失败' 
          })
        }
      },

      createSpace: async (data: CreateSpaceRequest) => {
        set({ loading: true, error: null })
        try {
          const response = await spaceService.createSpace(data)
          const newSpace = response.data
          set(state => ({ 
            spaces: [...state.spaces, newSpace],
            loading: false 
          }))
          return newSpace
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.error || error.message || '创建空间失败' 
          })
          throw error
        }
      },

      updateSpace: async (slug: string, data: Partial<CreateSpaceRequest>) => {
        set({ loading: true, error: null })
        try {
          const response = await spaceService.updateSpace(slug, data)
          const updatedSpace = response.data
          set(state => ({ 
            spaces: state.spaces.map(space => 
              space.slug === slug ? updatedSpace : space
            ),
            currentSpace: state.currentSpace?.slug === slug ? updatedSpace : state.currentSpace,
            loading: false 
          }))
          return updatedSpace
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.error || error.message || '更新空间失败' 
          })
          throw error
        }
      },

      deleteSpace: async (slug: string) => {
        set({ loading: true, error: null })
        try {
          await spaceService.deleteSpace(slug)
          set(state => ({ 
            spaces: state.spaces.filter(space => space.slug !== slug),
            currentSpace: state.currentSpace?.slug === slug ? null : state.currentSpace,
            loading: false 
          }))
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.error || error.message || '删除空间失败' 
          })
          throw error
        }
      },

      setCurrentSpace: (space: Space | null) => {
        set({ currentSpace: space })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'space-storage',
      partialize: (state) => ({ 
        currentSpace: state.currentSpace 
      }),
    }
  )
)