import express from "express";
import {
  get_tickets,
  get_tickets_info,
  purchase_ticket,
  update_ticket_status,
} from "../controllers/usersTicketController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { createPayment } from "Server/controllers/payment.controller.js";
const ticketRouter = express.Router();

ticketRouter.get("/tickets_home", authenticateTokenMiddleware, get_tickets);
ticketRouter.get(
  "/tickets_home/:ticketId",
  authenticateTokenMiddleware,
  get_tickets_info,
);
ticketRouter.post("/tickets_home", authenticateTokenMiddleware, createPayment);
ticketRouter.patch("/ticket/:ticketId/status", update_ticket_status);

ticketRouter.get("/ticket/chapa-webhook", async (req, res) => {
  const { trx_ref, status } = req.query;
  console.log("Webhook endpoint was hit!");
  console.log("trx_ref: ", trx_ref);
  console.log("status: ", status);
  try {
    const data = await verifyChapaPayment(trx_ref);

    if (data.status === "success" && data.data.status === "success") {
      await TransactionService.updateStatusByTxRef(trx_ref, "completed");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
  // 4. ALWAYS return a 200 OK to Chapa so they know you got it
  return res.status(200).send("Webhook received successfully");
});

async function verifyChapaPayment(trx_ref) {
  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${trx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    if (response.data.status === "success") {
      console.log("Payment Verified Successfully!");
      return response.data; //
    }
  } catch (error) {
    console.error(
      "Verification failed:",
      error.response?.data || error.message,
    );
  }
}

export default ticketRouter;
