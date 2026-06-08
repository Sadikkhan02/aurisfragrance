import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import aiRouter from "./routes/aiRoute.js";

//app config
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//app middleware
app.use(express.json());
app.use(cors());

//api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use('/api/order', orderRouter);
app.use("/api/ai", aiRouter);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Auris Fragrance API");
});

app.listen(PORT, () => {
  console.log(`server is running on Port ${PORT}`);
});
