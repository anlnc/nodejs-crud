import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export const generateAccessToken = (
  payload,
  options = {
    expiresIn: "15m",
  }
) => {
  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    options
  );
  return accessToken;
};

export const generateRefreshToken = (
  payload,
  options = {
    expiresIn: "1d",
  }
) => {
  const refreshToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    options
  );
  return refreshToken;
};

export const getBearerToken = ({ headers }) => {
  const Authorization = headers.Authorization || headers.authorization;
  const XAuthorization =
    headers["X-Authorization"] || headers["x-authorization"];
  if (!Authorization && !XAuthorization) {
    throw new Error("No authorization");
  }
  return (Authorization || XAuthorization).split(" ")[1];
};
