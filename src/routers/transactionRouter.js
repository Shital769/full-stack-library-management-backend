import express from "express";

import { getAllTransactions } from "../../../frontend/src/helpers/AxiosHelpers";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const transactions = await getAllTransactions();
    return res.json(transactions);
  } catch (error) {
    next(error);
  }
});

export default router;
