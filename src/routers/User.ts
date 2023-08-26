import { Router } from "express";
import { LoginHandler, SignupHandler, getAllUsers, getUserById, verifyEmail } from "../controllers/UserController";
import { SignupRequestValidator, verifyAuth } from "../helpers/Middleware";

const UserRouter = Router();

UserRouter.post('/verify', verifyEmail)

UserRouter.post('/signup', SignupRequestValidator, SignupHandler);

UserRouter.post('/login', LoginHandler);

UserRouter.get('/all',verifyAuth, getAllUsers);

UserRouter.get('/:id', verifyAuth,  getUserById);


export default UserRouter; 