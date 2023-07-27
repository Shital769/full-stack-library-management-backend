import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.NODE_ENV || 8000;

//connect to database

//middlewares
app.use(express.json());
app.use(cors());

//api routers

//all uncaught requests
app.use("*", (req, res) => {
  res.json({
    message: "System status is OK.ƒ",
  });
});

//global error handler
app.use((error, req, res, next) => {
  console.log(error.message);

  const errorCode = error.errorCode || 500;
  res.status(errorCode).json({
    status: error,
    message: error.message,
  });
});

//run the server
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Your server is running at http://localhost:${PORT}`);
});
