import mongoose, { connections } from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      return console.log(
        "Make sure environment variable MONGO_URL has mongodb connection link"
      );
    }
    mongoose.set("strictQuery", true);
    const connection = await mongoose.connect(process.env.MONGO_URL);

    connection?.connections && console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};
