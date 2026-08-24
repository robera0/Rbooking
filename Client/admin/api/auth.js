import api from "../../src/Context/api/api.config";

export async function login({ email, password }) {
  console.log(email, password);
  const response = await api.post(
    `/admins/login`,
    {
      email,
      password,
    }
  );
  console.log(response.data);
  return response.data;
}
