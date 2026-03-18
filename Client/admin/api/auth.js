import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "/api/v1"
    : "https://velvet-1kum.onrender.com/api/v1";

export async function login({ email, password }) {
  console.log(email, password);
  const response = await axios.post(
    `${API_URL}/admins/login`,
    {
      email,
      password,
    },
    { withCredentials: true },
  );
  console.log(response.data);
  return response.data;
}
