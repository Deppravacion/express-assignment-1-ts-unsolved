import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "./status-codes";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  HttpStatusCode;

export const errorHandleMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res
    .status(INTERNAL_SERVER_ERROR)
    .send("Something broke!");
};

export const validateReqId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id || !Number(req.params.id)) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "id should be a number" });
  }
  next();
};
