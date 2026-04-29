import { client, PageData } from './client';
import type { IterationVO, OperationLogVO } from './versions';

export { type IterationVO, type OperationLogVO };

interface IterationListParams {
  projectId?: number;
  versionId?: number;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export async function listIterations(params: IterationListParams) {
  return client.getPage<IterationVO>('/iterations', params as Record<string, string | number | undefined>);
}

export async function getIteration(id: number) {
  return client.get<IterationVO>(`/iterations/${id}`);
}

export async function createIteration(data: Record<string, unknown>) {
  return client.post<IterationVO>('/iterations', data);
}

export async function updateIteration(id: number, data: Record<string, unknown>) {
  return client.put<IterationVO>(`/iterations/${id}`, data);
}

export async function deleteIteration(id: number) {
  return client.delete<void>(`/iterations/${id}`);
}

export async function getIterationArs(id: number) {
  return client.get(`/iterations/${id}/ars`);
}

export async function getIterationStats(id: number) {
  return client.get<Record<string, unknown>>(`/iterations/${id}/stats`);
}

export async function getIterationLogs(id: number) {
  return client.get<OperationLogVO[]>(`/iterations/${id}/logs`);
}

export async function exportIterations(params: Omit<IterationListParams, 'page' | 'pageSize'>) {
  await client.download('/iterations/export', 'iterations.csv', params as Record<string, string | number | undefined>);
}
