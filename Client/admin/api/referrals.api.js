import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/Context/api/api.config";

const BASE = "/api/auth/admin/referrals";

export const useReferrals = () =>
  useQuery({
    queryKey: ["referrals"],
    queryFn: async () => (await api.get(BASE)).data.referrals || [],
  });

export const useReferralDetail = (id) =>
  useQuery({
    queryKey: ["referral", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`${BASE}/${id}`)).data,
  });

export const useCreateReferral = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await api.post(BASE, body)).data.referral,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["referrals"] }),
  });
};

export const useToggleReferral = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }) =>
      (await api.patch(`${BASE}/${id}`, { isActive })).data.referral,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      queryClient.invalidateQueries({ queryKey: ["referral", id] });
    },
  });
};
