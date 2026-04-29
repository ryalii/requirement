import { client, PageData } from './client';

export interface VersionVO {
  id: number;
  productName?: string;
  projectId: number;
  versionNumber: string;
  startDate?: string;
  endDate?: string;
  status: string;
  description?: string;
  createdAt: string;
}

export interface IterationVO {
  id: number;
  name: string;
  projectId?: number;
  productName?: string;
  versionId?: number;
  startDate?: string;
  endDate?: string;
  status: string;
  description?: string;
  createdAt: string;
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

interface VersionListParams {
  projectId?: number;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export async function listVersions(params: VersionListParams) {
  return client.getPage<VersionVO>('/versions', params as Record<string, string | number | undefined>);
}

export async function getVersion(id: number) {
  return client.get<VersionVO>(`/versions/${id}`);
}

export async function createVersion(data: Record<string, unknown>) {
  return client.post<VersionVO>('/versions', data);
}

export async function updateVersion(id: number, data: Record<string, unknown>) {
  return client.put<VersionVO>(`/versions/${id}`, data);
}

export async function deleteVersion(id: number) {
  return client.delete<void>(`/versions/${id}`);
}

export async function getVersionIterations(id: number) {
  return client.get<IterationVO[]>(`/versions/${id}/iterations`);
}

export async function getVersionStats(id: number) {
  return client.get<Record<string, unknown>>(`/versions/${id}/stats`);
}

export async function getVersionLogs(id: number) {
  return client.get<OperationLogVO[]>(`/versions/${id}/logs`);
}

export async function exportVersions(params: Omit<VersionListParams, 'page' | 'pageSize'>) {
  await client.download('/versions/export', 'versions.csv', params as Record<string, string | number | undefined>);
}
