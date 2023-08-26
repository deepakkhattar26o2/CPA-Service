import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken"
import { SignupRequest, LoginRequest, CurrentUser } from "./Types";

const authDetails = (req: Request): CurrentUser => {
  const token = String(req.headers.authorization);
  const decoded: CurrentUser | any = (jwt.verify(token, String(process.env.JWT_SECRET_KEY)));
  return decoded;
};

const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = String(req.headers.authorization);
    jwt.verify(token, String(process.env.JWT_SECRET_KEY));
    next();
  } catch (err) {
    return res.status(400).json({ Message: "Auth Failed!" });
  }
};

const missingResponse = (res: Response, field: string) => {
  return res.status(400).json({ message: `Missing ${field}` })
}

const SignupRequestValidator = (req: Request, res: Response, next: NextFunction) => {
  let body: SignupRequest = req.body;
  let field = '';
  if (!body.first_name) field = 'fist name';
  else if (!body.last_name) field = "last name";
  else if (!body.password) field = "password";
  else if (!body.uid) field = "uid";
  else if (!body.university_email) field = "email";
  if (field) {
    return missingResponse(res, field);
  }
  next();
};

const LoginRequestValidator = (req: Request, res: Response, next: NextFunction) => {
  const body : LoginRequest = req.body;
  let field = '';
  if (!body.university_email) field = "email";
  if (!body.password) field = "password";
  if(field){
    return missingResponse(res, field);
  }
  next();
}

export { SignupRequestValidator, LoginRequestValidator }

export { authDetails, verifyAuth }