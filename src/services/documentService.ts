import { request } from './api'
import type { 
  Document,
  DocumentTreeNode,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentQuery,
  DocumentListResponse,
  ApiResponse,
  VersionComparison,
  DocumentVersion
} from '@/types'

export const documentService = {
  // 获取文档列表
  getDocuments: (spaceSlug: string, query?: DocumentQuery): Promise<ApiResponse<DocumentListResponse>> => {
    const params = new URLSearchParams()
    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    if (query?.search) params.append('search', query.search)
    if (query?.parent_id) params.append('parent_id', query.parent_id)
    if (query?.is_published !== undefined) params.append('is_published', query.is_published.toString())
    
    const queryString = params.toString()
    return request.get(`/docs/${spaceSlug}${queryString ? `?${queryString}` : ''}`)
  },

  // 获取文档详情
  getDocument: (spaceSlug: string, docSlug: string): Promise<ApiResponse<Document>> =>
    request.get(`/docs/${spaceSlug}/${docSlug}`),

  // 创建文档
  createDocument: (spaceSlug: string, data: CreateDocumentRequest): Promise<ApiResponse<Document>> =>
    request.post(`/docs/${spaceSlug}`, data),

  // 更新文档
  updateDocument: (spaceSlug: string, docSlug: string, data: UpdateDocumentRequest): Promise<ApiResponse<Document>> =>
    request.put(`/docs/${spaceSlug}/${docSlug}`, data),

  // 删除文档
  deleteDocument: (spaceSlug: string, docSlug: string): Promise<ApiResponse<null>> =>
    request.delete(`/docs/${spaceSlug}/${docSlug}`),

  // 获取文档树结构
  getDocumentTree: (spaceSlug: string): Promise<ApiResponse<DocumentTreeNode[]>> =>
    request.get(`/docs/${spaceSlug}/tree`),

  // 获取文档子级
  getDocumentChildren: (spaceSlug: string, docSlug: string): Promise<ApiResponse<Document[]>> =>
    request.get(`/docs/${spaceSlug}/${docSlug}/children`),

  // 获取文档面包屑
  getDocumentBreadcrumbs: (spaceSlug: string, docSlug: string): Promise<ApiResponse<Document[]>> =>
    request.get(`/docs/${spaceSlug}/${docSlug}/breadcrumbs`),

  // 移动文档
  moveDocument: (spaceSlug: string, docSlug: string, data: {
    parent_id?: string
    new_order_index?: number
  }): Promise<ApiResponse<null>> =>
    request.post(`/docs/${spaceSlug}/${docSlug}/move`, data),

  // 复制文档
  duplicateDocument: (spaceSlug: string, docSlug: string, data?: {
    new_title?: string
    new_slug?: string
  }): Promise<ApiResponse<Document>> =>
    request.post(`/docs/${spaceSlug}/${docSlug}/duplicate`, data),

  // 发布/取消发布文档
  togglePublishDocument: (spaceSlug: string, docSlug: string, isPublished: boolean): Promise<ApiResponse<Document>> =>
    request.patch(`/docs/${spaceSlug}/${docSlug}/publish`, { is_published: isPublished }),

  // 批量操作
  batchDeleteDocuments: (spaceSlug: string, docIds: string[]): Promise<ApiResponse<null>> =>
    request.post(`/docs/${spaceSlug}/batch-delete`, { document_ids: docIds }),

  batchPublishDocuments: (spaceSlug: string, docIds: string[], isPublished: boolean): Promise<ApiResponse<null>> =>
    request.post(`/docs/${spaceSlug}/batch-publish`, { 
      document_ids: docIds, 
      is_published: isPublished 
    }),

  // 导出文档
  exportDocument: (spaceSlug: string, docSlug: string, format: 'pdf' | 'html' | 'markdown'): Promise<Blob> =>
    request.get(`/docs/${spaceSlug}/${docSlug}/export?format=${format}`, {
      responseType: 'blob'
    }).then(response => response.data),

  // 导入文档
  importDocument: (spaceSlug: string, file: File, options?: {
    parent_id?: string
    overwrite?: boolean
  }): Promise<ApiResponse<Document[]>> => {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.parent_id) formData.append('parent_id', options.parent_id)
    if (options?.overwrite) formData.append('overwrite', options.overwrite.toString())
    
    return request.upload(`/docs/${spaceSlug}/import`, formData)
  },

  // 版本相关
  getDocumentVersions: (spaceSlug: string, docSlug: string, page = 1, limit = 20): Promise<ApiResponse<{
    versions: DocumentVersion[]
    total: number
    page: number
    limit: number
  }>> =>
    request.get(`/docs/${spaceSlug}/${docSlug}/versions?page=${page}&limit=${limit}`),

  compareVersions: (spaceSlug: string, docSlug: string, fromVersion: string, toVersion: string): Promise<ApiResponse<VersionComparison>> =>
    request.get(`/docs/${spaceSlug}/${docSlug}/versions/compare?from=${fromVersion}&to=${toVersion}`),

  restoreVersion: (spaceSlug: string, docSlug: string, versionId: string): Promise<ApiResponse<Document>> =>
    request.post(`/docs/${spaceSlug}/${docSlug}/versions/${versionId}/restore`),

  deleteVersion: (spaceSlug: string, docSlug: string, versionId: string): Promise<ApiResponse<null>> =>
    request.delete(`/docs/${spaceSlug}/${docSlug}/versions/${versionId}`),
}