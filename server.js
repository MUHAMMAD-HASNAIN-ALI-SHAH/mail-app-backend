import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import connectDb from "./config/db.js";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/auth.route.js";
import mailRoutes from "./routes/mail.route.js";
import {app,server} from "./config/socket.js";
dotenv.config();  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v2/mail", mailRoutes);

const port = process.env.PORT

connectDb().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
