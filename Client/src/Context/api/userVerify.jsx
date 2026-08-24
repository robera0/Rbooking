import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api.config";
import toast from "react-hot-toast";

const verifyReceipt = async ({ userTicketId, receiptUrl }) => {
  const res = await api.post(
    `/api/auth/ticket/${userTicketId}/verify`,
    { receiptUrl }
  );
  const data = res.data;

  return data;
};

export const useVerify = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (verifyTicket) => verifyReceipt(verifyTicket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket"] });

      toast.success("Ticket Verified  successfully", {
        duration: 3000,
      });
    },
  });
};
