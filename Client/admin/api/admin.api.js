import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "/api/v1"
    : "https://velvet-1kum.onrender.com/api");

export async function getSalons() {
  const response = await axios.get(`${API_URL}/admins/salons?page=2`);
  console.log(response.data);
  return response.data?.data?.salons;
}
