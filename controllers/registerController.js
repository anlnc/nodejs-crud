import { hash } from "bcrypt";
import status from "http-status";
import { PrismaClient } from "@prisma/client";

import * as dotenv from "dotenv";
dotenv.config();

export const handleRegister = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const responseCode = status.BAD_REQUEST;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
  const SALT = process.env.SALT;
  const hashedPassword = await hash(password, parseInt(SALT));
  const credentials = {
    username,
    password: hashedPassword,
    fullname: password,
  };
  const prisma = new PrismaClient();
  let responseCode;
  try {
    await prisma.user.create({
      data: credentials,
    });
    responseCode = status.CREATED;
  } catch (error) {
    // Check unique constraint
    if (error.code === "P2002") {
      responseCode = status.CONFLICT;
    } else {
      responseCode = status.INTERNAL_SERVER_ERROR;
    }
  }
  await prisma.$disconnect();
  return res.status(responseCode).send({
    message: status[responseCode],
    code: responseCode,
  });
};
