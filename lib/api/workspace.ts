import { client } from './client';
import type { RequirementVO } from './requirements';
import type { TaskVO } from './tasks';

export async function getUrgentRequirements(limit?: number) {
  return client.get<RequirementVO[]>('/workspace/urgent-requirements', { limit: limit || 8 });
}

export async function getOverdueTasks() {
  return client.get<TaskVO[]>('/workspace/overdue-tasks');
}
