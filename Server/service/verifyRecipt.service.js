import oditClient from "./oditClient.service.js";
const verifyReceipt = async (receiptUrl) => {
  const response = await oditClient.post("/verify", { url: receiptUrl });
  return response.data;
};

export default verifyReceipt;
