import axios from "axios";
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "/api/v1"
    : "https://paysso.onrender.com");

export const buildFormData = () => {
  const fd = new FormData();

  fd.append("name", formState.name);
  fd.append("email", formState.email);
  fd.append("address", formState.address);
  fd.append("bio", formState.bio);
  fd.append("portfolio", formState.portfolio);

  fd.append("coordinates", JSON.stringify(formState.coordinates));

  return fd;
};
export async function add_salon(fd) {
  const response = await axios.post(`${API_URL}/admins/login`, fd, {
    withCredentials: true,
  });
  return response.data;
}
