import oditClient from "./oditClient.service.js";
const verifyReceipt = async (receiptUrl) => {
  try {
    const response = await oditClient.post("/verify", { url: receiptUrl });
    return response.data;
  } catch (err) {
    if (err.response?.status === 502 || err.response?.data?.ok === false) {
      return {
        error: "Invalid URL. Please check the receipt link and try again.",
      };
    }
    throw err;
  }
};
export default verifyReceipt;
