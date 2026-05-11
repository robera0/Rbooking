import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useService } from "@/Context/ServiceContext";
export const useWishlistMutation = () => {
  const { toggleWishlist, setAddFav } = useService();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: toggleWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  return { mutation };
};
