import { request } from './api'
import type { 
  SpaceMember,
  InviteMemberRequest,
  UpdateMemberRequest,
  SpaceInvitation,
  AcceptInvitationRequest,
  ApiResponse
} from '@/types'

export const spaceMemberService = {
  // 获取空间成员列表
  getSpaceMembers: (spaceSlug: string): Promise<ApiResponse<SpaceMember[]>> =>
    request.get(`/docs/spaces/${spaceSlug}/members`),

  // 邀请新成员
  inviteMember: (spaceSlug: string, data: InviteMemberRequest): Promise<ApiResponse<SpaceInvitation>> =>
    request.post(`/docs/spaces/${spaceSlug}/invite`, data),

  // 更新成员权限
  updateMember: (spaceSlug: string, userId: string, data: UpdateMemberRequest): Promise<ApiResponse<SpaceMember>> =>
    request.put(`/docs/spaces/${spaceSlug}/members/${userId}`, data),

  // 移除成员
  removeMember: (spaceSlug: string, userId: string): Promise<ApiResponse<null>> =>
    request.delete(`/docs/spaces/${spaceSlug}/members/${userId}`),

  // 接受邀请
  acceptInvitation: (data: AcceptInvitationRequest): Promise<ApiResponse<SpaceMember>> =>
    request.post('/docs/spaces/invitations/accept', data),
}