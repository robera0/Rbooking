import TransactionService from "../service/transaction.service.js";
import EventService from "../service/event.service.js";
import catchAsync from "../errors/catchAsync.js";
import AppError from "../errors/AppError.js";
import dotenv from "dotenv";
import axios from "axios";
import { CHAPA_CREATE_PAYMENT } from "../config/chap.config.js";
dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
export const createPayment = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const { email, id } = req.user;
  const { amount } = req.body;

  // first get the event and its price
  const event = await EventService.findById(eventId);

  if (!event) {
    throw new AppError("Event not found", 404);
  }
  console.log("amount: ", amount);
  console.log("event price: ", event.price);
  // check if the amount is the same as the service required amount
  if (Number(amount) !== Number(event.price)) {
    throw new AppError(
      "Amount is not the same as the service required amount",
      400,
    );
  }
  const currency = "ETB";
  const tx_ref = "tx_ref_" + Date.now();

  try {
    const payment = await axios.post(
      CHAPA_CREATE_PAYMENT,
      {
        amount: amount.toString(),
        currency,
        email,
        tx_ref,
        callback_url: "https://paysso.onrender.com/api/chapa-webhook",
        return_url: "", //we will add a url once the frontend is ready.
        customization: {
          title: "Paysso event",
          description: `Payment for ${event.name} event`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const transaction = TransactionService.create({
      user: req.user.id,
      event: eventId,
      tx_ref,
      amount,
      status: "pending",
    });

    await TransactionService.save(transaction);
    payment.data.data.tx_ref = tx_ref;
    res.status(200).json({
      status: "success",
      data: payment.data,
    });
  } catch (error) {
    // THIS IS THE MAGIC LINE! It will tell you exactly what field is failing.
    console.error(
      "Chapa API Error Details:",
      error.response?.data || error.message,
    );

    throw new AppError(
      error.response?.data?.message || "Payment initialization failed",
      400,
    );
  }
});
