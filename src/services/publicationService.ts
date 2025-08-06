import { request } from './api'
import type { ApiResponse } from '@/types'

// 发布相关的类型定义
export interface Publication {
  id: string
  space_id: string
  slug: string
  version: number
  title: string
  description?: string
  cover_image?: string
  theme: 'default' | 'dark' | 'minimal'
  
  // URLs
  public_url: string
  preview_url: string
  custom_domain?: string
  
  // 统计信息
  document_count: number
  total_views: number
  
  // 状态
  is_active: boolean
  published_by: string
  published_at: string
  updated_at: string
}

export interface CreatePublicationRequest {
  slug: string
  title: string
  description?: string
  cover_image?: string
  theme?: 'default' | 'dark' | 'minimal'
  
  // 发布设置
  include_private_docs?: boolean
  enable_search?: boolean
  enable_comments?: boolean
  custom_css?: string
  custom_js?: string
  
  // SEO 设置
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
}

export interface UpdatePublicationRequest {
  title?: string
  description?: string
  cover_image?: string
  theme?: 'default' | 'dark' | 'minimal'
  
  // 发布设置
  enable_search?: boolean
  enable_comments?: boolean
  custom_css?: string
  custom_js?: string
  
  // SEO 设置
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
}

export interface PublicationDocument {
  id: string
  publication_id: string
  original_doc_id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  parent_id?: string
  order_index: number
  word_count: number
  reading_time: number
  created_at: string
}

export interface PublicationDocumentNode {
  id: string
  title: string
  slug: string
  excerpt?: string
  order_index: number
  children: PublicationDocumentNode[]
}

export const publicationService = {
  // 发布空间
  publishSpace: (
    spaceId: string, 
    data: CreatePublicationRequest
  ): Promise<ApiResponse<Publication>> =>
    request.post(`/docs/publications/spaces/${encodeURIComponent(spaceId)}/publish`, data),

  // 获取空间的发布列表
  listPublications: (
    spaceId: string,
    includeInactive = false
  ): Promise<ApiResponse<Publication[]>> =>
    request.get(`/docs/publications/spaces/${encodeURIComponent(spaceId)}/publications`, {
      params: { include_inactive: includeInactive }
    }),

  // 更新发布
  updatePublication: (
    publicationId: string,
    data: UpdatePublicationRequest
  ): Promise<ApiResponse<Publication>> =>
    request.put(`/docs/publications/publications/${publicationId}`, data),

  // 重新发布
  republish: (
    publicationId: string,
    changeSummary?: string
  ): Promise<ApiResponse<Publication>> =>
    request.post(`/docs/publications/publications/${publicationId}/republish`, {
      change_summary: changeSummary
    }),

  // 取消发布
  unpublish: (publicationId: string): Promise<ApiResponse<null>> =>
    request.post(`/docs/publications/publications/${publicationId}/unpublish`),

  // 删除发布
  deletePublication: (publicationId: string): Promise<ApiResponse<null>> =>
    request.delete(`/docs/publications/publications/${publicationId}`),

  // === 公开访问API ===
  
  // 获取发布详情
  getPublication: (slug: string): Promise<ApiResponse<any>> =>
    request.get(`/docs/publications/p/${slug}`),

  // 获取发布的文档树
  getPublicationTree: (slug: string): Promise<ApiResponse<PublicationDocumentNode[]>> =>
    request.get(`/docs/publications/p/${slug}/tree`),

  // 获取发布的文档内容
  getPublicationDocument: (
    slug: string,
    docSlug: string
  ): Promise<ApiResponse<PublicationDocument>> =>
    request.get(`/docs/publications/p/${slug}/docs/${docSlug}`),

  // === 预览API（需要认证） ===
  
  // 获取发布详情（预览模式）
  getPublicationPreview: (publicationId: string): Promise<ApiResponse<any>> =>
    request.get(`/docs/publications/publications/${publicationId}`),

  // 获取发布的文档树（预览模式）
  getPublicationTreePreview: (publicationId: string): Promise<ApiResponse<PublicationDocumentNode[]>> =>
    request.get(`/docs/publications/publications/${publicationId}/tree`),

  // 获取发布的文档内容（预览模式）
  getPublicationDocumentPreview: (
    publicationId: string,
    docSlug: string
  ): Promise<ApiResponse<PublicationDocument>> =>
    request.get(`/docs/publications/publications/${publicationId}/docs/${docSlug}`),
}