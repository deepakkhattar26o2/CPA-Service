import { Request, Response } from "express";
import { AttachmentConfig, CurrentUser, LoginRequest, SignupRequest, UserUpdateRequest } from "../helpers/Types";
import prisma from "../../prisma";
import { User } from "@prisma/client";
import * as bcr from "bcrypt";
import * as rstr from 'randomstring'
import * as jwt from "jsonwebtoken"
import emailQueue from "../helpers/EmailQueue";
import { authDetails } from "../helpers/Middleware";
require('dotenv').config();

const verifyEmail = (req: Request, res: Response) => {
  const email: string = req.body.email;
  if (!email) {
    return res.status(400).json({ message: "Missing email!" });
  }
  const otp = rstr.generate(6);
  //adding email process to queue
  emailQueue.add(
    { email, otp },
    {
      attempts: 5,
      delay: 5000,
    }
  );

  return res.status(200).json({ otp: otp, email: email });
}

const SignupHandler = async (req: Request, res: Response) => {
  //destructuring request data
  const { university_email, first_name, last_name, password, uid }: SignupRequest = req.body;

  //configuring jwt expiry 
  var jwtConfig = {};
  if (req.query.remember == 'true') {
    jwtConfig = { expiresIn: String(process.env.JWT_EXPIRES_IN) };
  }

  //checking for an existing user
  let user: User | null = await prisma.user.findFirst({ where: { university_email: university_email } });
  if (user) {
    return res.status(409).json({ message: `Account with ${university_email} already exists!` });
  }

  //hashing the password using bcrypt
  bcr.hash(password, 13).then((hash: string) => {
    //creating user 
    prisma.user.create({
      data: {
        first_name: first_name,
        last_name: last_name,
        university_email: university_email,
        password: hash,
        uid: uid
      },
    }).then((doc: User | { password?: string }) => {
      // modifying user data to encrypt in jwt
      delete doc.password;
      const token = jwt.sign(doc, String(process.env.JWT_SECRET_KEY), jwtConfig)
      return res.status(200).json({ user: doc, token: token });
    }).catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
  })
    .catch((err: Error) => {
      return res.status(500).json({ message: err.message });
    });
};

const LoginHandler = async (req: Request, res: Response) => {
  const { university_email, password }: LoginRequest = req.body;

  //configuring jwt expiry 
  var jwtConfig = {};
  if (req.query.remember == 'true') {
    jwtConfig = { expiresIn: String(process.env.JWT_EXPIRES_IN) };
  }

  //checking for an existing user
  let user: User | null = await prisma.user.findFirst({ where: { university_email: university_email } });
  if (!user) {
    return res.status(404).json({ message: `User with ${university_email} doesn't exist!` });
  }

  let mUser: any | { password?: string } = user;
  //comparing password with stored hash
  bcr.compare(password, user.password).then((match: boolean) => {
    if (!match) {
      return res.status(409).json({ message: "Wrong Password!" });
    }
    delete mUser.password;
    const token = jwt.sign(mUser, String(process.env.JWT_SECRET_KEY), jwtConfig)
    return res.status(200).json({ user: mUser, token: token });

  }).catch(
    (err: Error) => { return res.status(500).json({ message: err.message }) }
  )
}

const getUserById = async (req: Request, res: Response) => {
  //checking for a valid id param
  if (!Number(req.params.id)) {
    return res.status(400).json({ message: "missing/invalid id" })
  }
  const id = Number(req.params.id);
  //fetching user data from db
  const user: User | null = await prisma.user.findFirst({ where: { id: id } })
  //handling wrong user id
  if (!user) {
    return res.status(404).json({ message: `User doesn't exist!` });
  }

  return res.status(200).json({ user: user })
}

const getAllUsers = async (req: Request, res: Response) => {
  let users: User[] = await prisma.user.findMany();
  return res.status(200).json({ users: users });
}

const updateUserDetails = (req: Request, res: Response) => {
  const user: CurrentUser = authDetails(req);
  const body: UserUpdateRequest = req.body;
  prisma.user.update({ where: { id: user.id }, data: body }).then(
    (uuser: User | { password?: string }) => {
      delete uuser.password;
      return res.status(200).json({ updatedUser: uuser })
    }
  )
    .catch((err: Error) => { return res.status(500).json({ message: err.message }) })
}


const handleAttachmentUpload = (req: Request, res: Response) => {
  const user: CurrentUser = authDetails(req);
  let field = String(req.query.attachment_type)
  var attachmentConfig: AttachmentConfig = {}

  if (field == 'resume') {
    attachmentConfig = { has_resume_attachment: true }
  }
  else if (field == 'hsc') {
    attachmentConfig = { has_hsc_attachment: true }
  }
  else if(field=='matric'){
    attachmentConfig = {has_matric_attachment : true}
  }
  else if(field=='pfp'){
    attachmentConfig = {has_pfp_attachment : true}
  }
  prisma.user.update({ where: { id: user.id }, data: attachmentConfig })
  .then((doc)=>{res.status(200).json({message : `${field} uploaded successfully`})})
  .catch((err : Error)=>{ res.status(500).json({message : err.message})})
}

export { SignupHandler, LoginHandler, getUserById, getAllUsers, verifyEmail, updateUserDetails , handleAttachmentUpload};