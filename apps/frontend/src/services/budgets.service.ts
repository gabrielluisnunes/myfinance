import { api } from "./api";

export interface Budget {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  amount: string;
  spent: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; color: string; icon: string };
}

export interface CreateBudgetPayload {
  categoryId: string;
  month: number;
  year: number;
  amount: number;
}

export const budgetsService = {
  async list(month: number, year: number): Promise<Budget[]> {
    const { data } = await api.get<{ data: Budget[] }>("/budgets", {
      params: { month, year },
    });
    return data.data;
  },

  async create(payload: CreateBudgetPayload): Promise<Budget> {
    const { data } = await api.post<{ data: Budget }>("/budgets", payload);
    return data.data;
  },

  async update(id: string, amount: number): Promise<Budget> {
    const { data } = await api.patch<{ data: Budget }>(`/budgets/${id}`, {
      amount,
    });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
