import { api } from "./api";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  savedAmount: string;
  icon: string | null;
  color: string | null;
  deadline: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  icon?: string;
  color?: string;
  deadline?: string | null;
}

export interface UpdateGoalPayload {
  name?: string;
  targetAmount?: number;
  icon?: string | null;
  color?: string | null;
  deadline?: string | null;
  status?: GoalStatus;
}

export const goalsService = {
  async list(): Promise<Goal[]> {
    const { data } = await api.get<{ data: Goal[] }>("/goals");
    return data.data;
  },

  async create(payload: CreateGoalPayload): Promise<Goal> {
    const { data } = await api.post<{ data: Goal }>("/goals", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateGoalPayload): Promise<Goal> {
    const { data } = await api.patch<{ data: Goal }>(`/goals/${id}`, payload);
    return data.data;
  },

  async deposit(id: string, amount: number): Promise<Goal> {
    const { data } = await api.post<{ data: Goal }>(`/goals/${id}/deposit`, {
      amount,
    });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};
