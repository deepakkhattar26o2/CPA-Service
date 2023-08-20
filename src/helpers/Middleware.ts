import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken"
import { CurrentUser } from "./Types";

const authDetails = (req: Request):  CurrentUser => {
    const token = String(req.headers.authorization);
    const decoded : CurrentUser  | any= (jwt.verify(token, String(process.env.JWT_SECRET_KEY)));
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

  
  export {authDetails, verifyAuth}