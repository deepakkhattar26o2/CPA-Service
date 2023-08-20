import { NextFunction, Request, Response } from "express";
import { LoginRequest, SignupRequest, CurrentUser } from "../helpers/Types";
import prisma from "../../prisma";
import { User } from "@prisma/client";
import { SignupRequestValidator, LoginRequestValidator } from "../helpers/RequestValidators";
import { error, reqMissed, invalidField, notFound } from "../helpers/Responses";
import * as bcr from "bcrypt";
import * as rstr from 'randomstring'
import * as jwt from "jsonwebtoken"
import emailQueue from "../helpers/EmailQueue";
require('dotenv').config();

const verifyEmail = (req: Request, res: Response) => {
  const email: string = req.body.email;
  if (!email) {
    return reqMissed(res, 'email');
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

  return res.status(200).json({otp : otp, email : email});
}

const SignupHandler = async (req: Request, res: Response) => {
  //json request body
  const body: SignupRequest = req.body;

  // validating sign up request using essential parameters required to create a user
  const validation = SignupRequestValidator(body);

  //handling failed validation
  if (!validation[0]) {
    return reqMissed(res, validation[1]);
  }

  //destructuring request data
  const { university_email, first_name, last_name, password, uid } = body;

  //configuring jwt expiry 
  var jwtConfig = {};
  if (req.query.remember == 'true') {
    jwtConfig = { expiresIn: String(process.env.JWT_EXPIRES_IN) };
  }

  //checking for an existing user
  let user: User | null = await prisma.user.findFirst({ where: { university_email: university_email } });
  if (user) {
    return invalidField(res, 'Email');
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
      return error(res, err.message);
    });
  })
    .catch((err: Error) => {
      return error(res, err.message);
    });
};

const LoginHandler = async (req: Request, res: Response) => {
  //json request body
  const body: LoginRequest = req.body;

  //validating request body
  const validation = LoginRequestValidator(body);
  if (!validation[0]) {
    return reqMissed(res, validation[1]);
  }

  const { university_email, password } = body;

  //configuring jwt expiry 
  var jwtConfig = {};
  if (req.query.remember == 'true') {
    jwtConfig = { expiresIn: String(process.env.JWT_EXPIRES_IN) };
  }

  //checking for an existing user
  let user: User | null = await prisma.user.findFirst({ where: { university_email: university_email } });
  if (!user) {
    return notFound(res, 'User');
  }

  let mUser: any | { password?: string } = user;
  //comparing password with stored hash
  bcr.compare(password, user.password).then((match: boolean) => {
    if (!match) {
      return invalidField(res, password);
    }
    delete mUser.password;
    const token = jwt.sign(mUser, String(process.env.JWT_SECRET_KEY), jwtConfig)
    return res.status(200).json({ user: mUser, token: token });

  }).catch(
    (err: Error) => { return error(res, err.message) }
  )
}

const getUserById = async (req: Request, res: Response) => {
  //checking for a valid id param
  if (!Number(req.params.id)) {
    return invalidField(res, 'ID')
  }
  const id = Number(req.params.id);
  //fetching user data from db
  const user: User | null = await prisma.user.findFirst({ where: { id: id } })
  //handling wrong user id
  if (!user) {
    return notFound(res, "User");
  }

  return res.status(200).json({ user: user })
}

const getAllUsers = async (req: Request, res: Response) => {
  let users: User[] = await prisma.user.findMany();
  return res.status(200).json({ users: users });
}


export { SignupHandler, LoginHandler, getUserById, getAllUsers, verifyEmail };