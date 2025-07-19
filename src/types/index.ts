// 用户相关类型
export interface User {
  id: string
  email: string
  is_email_verified: boolean
  created_at: string
  has_password: boolean
  account_status: 'Active' | 'Inactive' | 'Suspended' | 'PendingDeletion' | 'Deleted'
  last_login_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
}

// 空间相关类型
export interface Space {
  id: string
  name: string
  slug: string
  description?: string
  is_public: boolean
  created_by: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export interface CreateSpaceRequest {
  name: string
  slug: string
  description?: string
  is_public: boolean
}

// 文档相关类型
export interface Document {
  id: string
  space_id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  parent_id?: string
  sort_order: number
  is_published: boolean
  is_deleted: boolean
  created_by: string
  created_at: string
  updated_at: string
  word_count: number
  reading_time?: number
}

export interface DocumentTreeNode {
  id: string
  title: string
  slug: string
  is_published: boolean
  sort_order: number
  children: DocumentTreeNode[]
}

export interface CreateDocumentRequest {
  title: string
  slug: string
  content: string
  parent_id?: string
  is_published: boolean
}

export interface UpdateDocumentRequest {
  title?: string
  content?: string
  is_published?: boolean
}

// 文档查询和响应类型
export interface DocumentQuery {
  page?: number
  limit?: number
  search?: string
  parent_id?: string
  is_published?: boolean
}

export interface DocumentListItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  is_published: boolean
  created_at: string
  updated_at: string
  sort_order: number
}

export interface DocumentListResponse {
  documents: DocumentListItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// 搜索相关类型
export interface SearchQuery {
  query: string
  space_id?: string
  filters?: SearchFilters
  page?: number
  limit?: number
}

export interface SearchFilters {
  document_type?: string[]
  tags?: string[]
  author?: string[]
  date_range?: {
    start: string
    end: string
  }
}

export interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string
  space_id: string
  space_name: string
  url: string
  score: number
  highlights: SearchHighlight[]
}

export interface SearchHighlight {
  field: string
  fragments: string[]
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
  took: number
  suggestions?: string[]
}

// 标签相关类型
export interface Tag {
  id: string
  name: string
  slug: string
  color: string
  description?: string
  space_id?: string
  created_at: string
  updated_at: string
}

// 评论相关类型
export interface Comment {
  id: string
  document_id: string
  user_id: string
  content: string
  parent_id?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  user_name: string
  like_count: number
  is_liked: boolean
}

// 文件相关类型
export interface FileUpload {
  id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  mime_type: string
  file_path: string
  uploaded_by: string
  space_id?: string
  document_id?: string
  created_at: string
}

// 版本相关类型
export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  content: string
  change_summary?: string
  created_by: string
  created_at: string
}

export interface VersionComparison {
  from_version: DocumentVersion
  to_version: DocumentVersion
  changes: VersionChange[]
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified'
  line_number: number
  content: string
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// 空间列表响应（后端返回的格式）
export interface SpaceListResponse {
  spaces: Space[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// 通用类型
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  children?: MenuItem[]
  disabled?: boolean
}

// 主题类型
export interface Theme {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  shadow: string
}

// 状态类型
export interface LoadingState {
  loading: boolean
  error?: string
}

export interface AsyncState<T> extends LoadingState {
  data?: T
}

// 路由类型
export interface RouteParams {
  spaceSlug?: string
  docSlug?: string
  [key: string]: string | undefined
}

// 编辑器相关类型
export interface EditorConfig {
  readOnly: boolean
  autoSave: boolean
  autoSaveInterval: number
  theme: 'light' | 'dark'
  showLineNumbers: boolean
  wordWrap: boolean
}

// 权限相关类型
export interface Permission {
  resource: string
  action: string
  granted: boolean
}