import { client, PageData } from './client';

export interface TaskVO {
  id: number;
  code: string;
  name: string;
  type: string;
  assignee?: string;
  creator: string;
  deadline: string;
  status: string;
  description?: string;
  relatedRequirementId?: number;
  createdAt: string;
  updatedAt?: string;
  daysRemaining: number;
  overdue: boolean;
  histories?: TaskHistoryVO[];
}

export interface TaskStatsVO {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface TaskHistoryVO {
  id: number;
  taskId: number;
  action: string;
  operator: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
}

export interface TaskCreateRequest {
  name: string;
  type: string;
  assignee?: string;
  creator: string;
  deadline: string;
  description?: string;
  relatedRequirementId?: number;
}

export interface TaskUpdateRequest {
  name?: string;
  type?: string;
  assignee?: string;
  deadline?: string;
  description?: string;
  relatedRequirementId?: number;
}

interface TaskListParams {
  type?: string;
  status?: string;
  keyword?: string;
  assignee?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export async function listTasks(params: TaskListParams) {
  return client.getPage<TaskVO>('/tasks', params as Record<string, string | number | undefined>);
}

export async function getTaskStats() {
  return client.get<TaskStatsVO>('/tasks/stats');
}

export async function getTask(id: number) {
  return client.get<TaskVO>(`/tasks/${id}`);
}

export async function createTask(data: TaskCreateRequest) {
  return client.post<TaskVO>('/tasks', data);
}

export async function updateTask(id: number, data: TaskUpdateRequest) {
  return client.put<TaskVO>(`/tasks/${id}`, data);
}

export async function deleteTask(id: number) {
  return client.delete<void>(`/tasks/${id}`);
}

export async function assignTask(id: number, assignee: string) {
  return client.patch<TaskVO>(`/tasks/${id}/assign`, { assignee });
}

export async function changeTaskStatus(id: number, status: string) {
  return client.patch<TaskVO>(`/tasks/${id}/status`, { status });
}

export async function getTaskHistories(id: number) {
  return client.get<TaskHistoryVO[]>(`/tasks/${id}/histories`);
}

export async function exportTasks(params: Omit<TaskListParams, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>) {
  await client.download('/tasks/export', 'tasks.csv', params as Record<string, string | number | undefined>);
}
