import { API_BASE_URL } from "./constants.js";
// import * as axios from "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";

// axios.default
//   .get("https://jsonplaceholder.typicode.com/todos/1")
//   .then((response) => console.log(response.data))
//   .catch((error) => console.error(error));

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const productService = {
  getAll: async () => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  create: async (product) => {
    try {
      const response = await api.post("/", product);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  update: async (id, product) => {
    try {
      const response = await api.put(`/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};
