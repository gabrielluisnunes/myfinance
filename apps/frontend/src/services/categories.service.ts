import { api } from "./api";

export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: Category["type"];
  color?: string;
  icon?: string;
}

export const categoriesService = {
  async list(type?: Category["type"]): Promise<Category[]> {
    const { data } = await api.get<{ data: Category[] }>("/categories", {
      params: type ? { type } : undefined,
    });
    return data.data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await api.post<{ data: Category }>("/categories", payload);
    return data.data;
  },

  async update(
    id: string,
    payload: Partial<CreateCategoryPayload>,
  ): Promise<Category> {
    const { data } = await api.patch<{ data: Category }>(
      `/categories/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
