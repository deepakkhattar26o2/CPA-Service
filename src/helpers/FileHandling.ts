import * as fs from "fs";
import path from "path";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { CurrentUser } from "../../types";
import { authDetails } from "./Middleware";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const fileStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ): void => {
    cb(null, "./uploads/");
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ): void => {
    let ext = String(req.query.attachment_type) == "pfp" ? "jpg" : "pdf";
    const currUser: CurrentUser = authDetails(req);
    let sender = currUser.role == "UNIVERSITY" ? "c" : "s";
    cb(null, `${currUser.id}-${sender}-${req.query.attachment_type}.${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const UploadFile = multer({
  storage: fileStorage,
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
  fileFilter: fileFilter,
});

const ValidateDirectory = () => {
  if (!fs.existsSync(path.join(__dirname, "../../uploads"))) {
    fs.mkdirSync(path.join(__dirname, "../../uploads"));
    fs.writeFile(
      path.join(__dirname, "../../uploads", "default.jpg"),
      "Hello content!",
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
};

export { ValidateDirectory, UploadFile };
