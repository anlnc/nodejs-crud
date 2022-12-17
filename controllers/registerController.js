import { hash } from "bcrypt";
import status from "http-status";
import prisma from "../functions/prisma.js";

import * as dotenv from "dotenv";
dotenv.config();

export const handleRegister = async (req, res) => {
  const { email, password, name, groupId, role } = req.body;
  if (!email || !password || !name || !groupId || !role) {
    const responseCode = status.BAD_REQUEST;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
  const SALT = process.env.SALT;
  const hashedPassword = await hash(password, parseInt(SALT));
  const credentials = {
    email,
    password: hashedPassword,
    name,
    role,
    group_id: groupId,
  };
  let responseCode;
  try {
    await prisma.users.create({
      data: credentials,
    });
    responseCode = status.CREATED;
  } catch (error) {
    // Check unique constraint
    if (error.code === "P2002") {
      responseCode = status.CONFLICT;
    } else {
      await prisma.$disconnect();
      console.error("Unsuccessfully Created: ", error.message);
      responseCode = status.INTERNAL_SERVER_ERROR;
    }
  }
  return res.status(responseCode).send({
    message: status[responseCode],
    code: responseCode,
  });
};
