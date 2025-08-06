import { request } from './api'
import type { ApiResponse } from '@/types'

export interface DocumentStats {
  total_documents: number
  total_spaces: number
  total_comments: number
  documents_created_today: number
  most_active_spaces: SpaceActivity[]
}

export interface SpaceActivity {
  space_id: string
  space_name: string
  document_count: number
  recent_activity: number
}

export interface SearchStats {
  total_documents: number
  total_searches_today: number
  most_searched_terms: SearchTerm[]
  recent_searches: RecentSearch[]
}

export interface SearchTerm {
  term: string
  count: number
}

export interface RecentSearch {
  query: string
  results_count: number
  timestamp: string
}

export const statsService = {
  // 获取文档统计
  getDocumentStats: (): Promise<ApiResponse<DocumentStats>> =>
    request.get('/docs/stats/documents'),

  // 获取搜索统计
  getSearchStats: (): Promise<ApiResponse<SearchStats>> =>
    request.get('/docs/stats/search'),
}