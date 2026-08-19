import axios from "axios";
import "dotenv/config";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("ODIT_API_KEY is not configured on the server");
}

const oditClient = axios.create({
  baseURL: "https://v.odit.et/api",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

export default oditClient;
