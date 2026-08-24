import api from "../../src/Context/api/api.config";

export async function getSalons() {
  const response = await api.get(`/admins/salons?page=2`);
  console.log(response.data);
  return response.data?.data?.salons;
}
