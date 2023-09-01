import { Router } from "express";
import { LoginHandler, SignupHandler, getAllUsers, getUserById, handleAttachmentUpload, updateUserDetails, verifyEmail } from "../controllers/UserController";
import { FileNameValidator, LoginRequestValidator, SignupRequestValidator, VerifyAuth } from "../helpers/Middleware";
import { UploadFile } from "../helpers/FileHandling";

const UserRouter = Router();

UserRouter.post('/verify', verifyEmail)

UserRouter.post('/signup', SignupRequestValidator, SignupHandler);

UserRouter.post('/login', LoginRequestValidator, LoginHandler);

UserRouter.post('/upload', VerifyAuth, FileNameValidator, UploadFile.single('file'), handleAttachmentUpload)

UserRouter.get('/all', VerifyAuth, getAllUsers);

UserRouter.patch('/user', VerifyAuth, updateUserDetails);

UserRouter.get('/:id', VerifyAuth, getUserById);


export default UserRouter; 