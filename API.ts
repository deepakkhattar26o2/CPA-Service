import { Router } from "express";
import UserRouter from "./src/routers/User";

const AppRouter = Router();

AppRouter.use('/user', UserRouter)

export default AppRouter;