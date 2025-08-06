import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRoute from "./routes/user.route.js";
import GigRoute from "./routes/gig.route.js";
import OrderRoute from "./routes/order.route.js";
import ConveersationRoute from "./routes/conversation.route.js";
import MessageRoute from "./routes/message.route.js";
import ReviewRoute from "./routes/review.route.js";
import AuthRoute from "./routes/auth.route.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/users", UserRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/gigs", GigRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/conversations", ConveersationRoute);
app.use("/api/messages", MessageRoute);
app.use("/api/reviews", ReviewRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";

  return res.status(errorStatus).json({
    status: errorStatus,
    message: errorMessage,
  });
});

export { app };
