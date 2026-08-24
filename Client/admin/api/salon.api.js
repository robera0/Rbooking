import api from "../../src/Context/api/api.config";

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
  const response = await api.post(`/admins/login`, fd);
  return response.data;
}
