import { client } from './client';
import type { RequirementVO } from './requirements';
import type { TaskVO } from './tasks';

// 工作安排类型
export interface WorkItemVO {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'task' | 'review';
  color: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUrgentRequirements(limit?: number) {
  return client.get<RequirementVO[]>('/workspace/urgent-requirements', { limit: limit || 8 });
}

export async function getOverdueTasks() {
  return client.get<TaskVO[]>('/workspace/overdue-tasks');
}

// 获取工作安排列表
export async function getWorkItems() {
  return client.get<WorkItemVO[]>('/workspace/work-items');
}

// 创建工作安排
export async function createWorkItem(data: Omit<WorkItemVO, 'id' | 'createdAt' | 'updatedAt'>) {
  return client.post<WorkItemVO>('/workspace/work-items', data);
}

// 删除工作安排
export async function deleteWorkItem(id: string) {
  return client.delete(`/workspace/work-items/${id}`);
}
