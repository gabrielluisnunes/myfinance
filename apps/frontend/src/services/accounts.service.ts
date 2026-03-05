import { api } from "./api";

export interface CreditCard {
  id: string;
  limit: string;
  closingDay: number;
  dueDay: number;
}

export interface Account {
  id: string;
  name: string;
  type: "CHECKING" | "SAVINGS" | "INVESTMENT" | "WALLET";
  balance: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creditCard: CreditCard | null;
}

export interface CreateAccountPayload {
  name: string;
  type: Account["type"];
  balance?: number;
  currency?: string;
}

export const accountsService = {
  async list(): Promise<Account[]> {
    const { data } = await api.get<{ data: Account[] }>("/accounts");
    return data.data;
  },

  async create(payload: CreateAccountPayload): Promise<Account> {
    const { data } = await api.post<{ data: Account }>("/accounts", payload);
    return data.data;
  },

  async update(
    id: string,
    payload: Partial<CreateAccountPayload>,
  ): Promise<Account> {
    const { data } = await api.patch<{ data: Account }>(
      `/accounts/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },
};
