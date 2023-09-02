import express, { Router } from "express";
import UserRouter from "./src/routers/User";
import path from "path";

const AppRouter = Router();

AppRouter.use('/user', UserRouter)

AppRouter.use("/uploads", express.static(path.join(__dirname, "uploads")));

export default AppRouter;