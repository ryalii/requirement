import { client, PageData } from './client';

export interface ProjectVO {
  id: number;
  name: string;
  code: string;
  financeCode?: string;
  owner?: string;
  manager?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  description?: string;
  createdAt: string;
  versionCount: number;
  iterationCount: number;
  memberCount: number;
  requirementCount: number;
}

export interface ProjectDetailVO {
  project: ProjectVO;
  stats: {
    totalRequirements: number;
    completedRequirements: number;
    inProgressRequirements: number;
  };
  members: ProjectMemberVO[];
  logs: OperationLogVO[];
}

export interface ProjectMemberVO {
  id: number;
  projectId: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface OperationLogVO {
  id: number;
  targetType: string;
  targetId: number;
  action: string;
  operator: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
}

export interface ProjectCreateRequest {
  name: string;
  code: string;
  financeCode?: string;
  owner?: string;
  manager?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  description?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  financeCode?: string;
  owner?: string;
  manager?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  description?: string;
}

interface ProjectListParams {
  keyword?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function listProjects(params: ProjectListParams) {
  return client.getPage<ProjectVO>('/projects', params as Record<string, string | number | undefined>);
}

export async function getProject(id: number) {
  return client.get<ProjectDetailVO>(`/projects/${id}`);
}

export async function createProject(data: ProjectCreateRequest) {
  return client.post<ProjectVO>('/projects', data);
}

export async function updateProject(id: number, data: ProjectUpdateRequest) {
  return client.put<ProjectVO>(`/projects/${id}`, data);
}

export async function deleteProject(id: number) {
  return client.delete<void>(`/projects/${id}`);
}

export async function getProjectTree(id: number) {
  return client.get(`/projects/${id}/tree`);
}

export async function getProjectMembers(id: number) {
  return client.get<ProjectMemberVO[]>(`/projects/${id}/members`);
}

export async function addProjectMember(id: number, data: { name: string; role: string; email?: string; phone?: string }) {
  return client.post<ProjectMemberVO>(`/projects/${id}/members`, data);
}

export async function removeProjectMember(id: number, memberId: number) {
  return client.delete<void>(`/projects/${id}/members/${memberId}`);
}

export async function getProjectLogs(id: number) {
  return client.get<OperationLogVO[]>(`/projects/${id}/logs`);
}

export async function exportProjects(params: Omit<ProjectListParams, 'page' | 'pageSize'>) {
  await client.download('/projects/export', 'projects.csv', params as Record<string, string | number | undefined>);
}
