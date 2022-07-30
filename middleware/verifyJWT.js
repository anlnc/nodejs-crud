import status from "http-status";
import jwt from "jsonwebtoken";
import { getBearerToken } from "../functions/jwt.js";
import * as dotenv from "dotenv";
dotenv.config();

const { ACCESS_TOKEN_SECRET } = process.env;

export const verifyJWT = (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    const responseCode = status.UNAUTHORIZED;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
  try {
    const { userId, username, isAdmin } = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    );
    req.user = { userId, username, isAdmin };
    next();
  } catch (exception) {
    const responseCode = status.FORBIDDEN;
    res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
};
