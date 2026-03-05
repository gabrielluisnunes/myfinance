import { api } from "./api";

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  status: "PENDING" | "CONFIRMED";
  amount: string;
  description: string;
  date: string;
  notes?: string;
  createdAt: string;
  account: { id: string; name: string; type: string };
  category: { id: string; name: string; color: string; icon: string };
  invoice: { id: string; month: number; year: number } | null;
  tags: { tag: { id: string; name: string; color: string } }[];
}

export interface TransactionMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: "INCOME" | "EXPENSE";
  status?: "PENDING" | "CONFIRMED";
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateTransactionPayload {
  accountId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  status?: "PENDING" | "CONFIRMED";
  amount: number;
  description: string;
  date: string;
  notes?: string;
  tagIds?: string[];
  invoiceId?: string;
}

export const transactionsService = {
  async list(
    filters: TransactionFilters = {},
  ): Promise<{ data: Transaction[]; meta: TransactionMeta }> {
    // List endpoint returns { data: [], meta: {} } directly (not wrapped)
    const { data } = await api.get<{
      data: Transaction[];
      meta: TransactionMeta;
    }>("/transactions", {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Transaction> {
    const { data } = await api.get<{ data: Transaction }>(
      `/transactions/${id}`,
    );
    return data.data;
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const { data } = await api.post<{ data: Transaction }>(
      "/transactions",
      payload,
    );
    return data.data;
  },

  async update(
    id: string,
    payload: Partial<CreateTransactionPayload>,
  ): Promise<Transaction> {
    const { data } = await api.patch<{ data: Transaction }>(
      `/transactions/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
