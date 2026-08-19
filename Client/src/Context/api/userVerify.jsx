import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const verifyReceipt = async ({ userTicketId, receiptUrl }) => {
  const res = await axios.post(
    `${API_URL}/api/auth/ticket/${userTicketId}/verify`,
    { receiptUrl },
    {
      withCredentials: true,
    },
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
