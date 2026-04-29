import { client, PageData } from './client';

export interface RequirementVO {
  id: number;
  code: string;
  name: string;
  type: string;
  customer: string;
  project?: string;
  expectedDate: string;
  status: string;
  priority: string;
  description?: string;
  parentId?: number;
  parentCode?: string;
  parentType?: string;
  irId?: number;
  iterationId?: number;
  frontend?: string;
  backend?: string;
  tester?: string;
  testCaseCount?: number;
  createdAt: string;
  updatedAt?: string;
  childrenCount?: number;
}

export interface RequirementTreeVO {
  requirement: RequirementVO;
  children: RequirementTreeVO[];
}

export interface RequirementAncestorVO {
  id: number;
  code: string;
  type: string;
  name: string;
}

export interface RequirementCreateRequest {
  name: string;
  type: string;
  customer: string;
  project?: string;
  expectedDate: string;
  status?: string;
  priority?: string;
  description?: string;
  parentId?: number;
  iterationId?: number;
  frontend?: string;
  backend?: string;
  tester?: string;
}

export interface RequirementUpdateRequest {
  name?: string;
  customer?: string;
  project?: string;
  expectedDate?: string;
  status?: string;
  priority?: string;
  description?: string;
  iterationId?: number;
  frontend?: string;
  backend?: string;
  tester?: string;
  updatedAt?: string;
}

export interface ConvertToIrRequest {
  name?: string;
  description?: string;
  priority?: string;
  expectedDate?: string;
}

export interface DecomposeRequest {
  items: Array<{
    name: string;
    description?: string;
    priority?: string;
  }>;
}

interface RequirementListParams {
  type?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export async function listRequirements(params: RequirementListParams) {
  return client.getPage<RequirementVO>('/requirements', params as Record<string, string | number | undefined>);
}

export async function getRequirement(id: number) {
  return client.get<RequirementVO>(`/requirements/${id}`);
}

export async function createRequirement(data: RequirementCreateRequest) {
  return client.post<RequirementVO>('/requirements', data);
}

export async function updateRequirement(id: number, data: RequirementUpdateRequest) {
  return client.put<RequirementVO>(`/requirements/${id}`, data);
}

export async function deleteRequirement(id: number) {
  return client.delete<void>(`/requirements/${id}`);
}

export async function convertToIr(id: number, data: ConvertToIrRequest) {
  return client.post<RequirementVO>(`/requirements/${id}/convert-to-ir`, data);
}

export async function decompose(id: number, data: DecomposeRequest) {
  return client.post<RequirementVO[]>(`/requirements/${id}/decompose`, data);
}

export async function getRequirementTree(id: number) {
  return client.get<RequirementTreeVO>(`/requirements/${id}/tree`);
}

export async function getChildren(id: number) {
  return client.get<RequirementVO[]>(`/requirements/${id}/children`);
}

export async function getAncestors(id: number) {
  return client.get<RequirementAncestorVO[]>(`/requirements/${id}/ancestors`);
}

export async function exportRequirements(params: Omit<RequirementListParams, 'page' | 'pageSize'>) {
  await client.download('/requirements/export', 'requirements.csv', params as Record<string, string | number | undefined>);
}
