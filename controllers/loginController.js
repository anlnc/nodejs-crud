import { compare } from "bcrypt";
import status from "http-status";
import { PrismaClient } from "@prisma/client";
import { generateAccessToken } from "../functions/jwt.js";

export const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const responseCode = status.BAD_REQUEST;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    await prisma.$disconnect();

    const responseCode = status.INTERNAL_SERVER_ERROR;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  await prisma.$disconnect();
  if (!foundUser) {
    const responseCode = status.NOT_FOUND;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
  const { password: hashedPassword } = foundUser;
  const isCorrectPassword = await compare(password, hashedPassword);
  if (!isCorrectPassword) {
    const responseCode = status.UNAUTHORIZED;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }

  const accessToken = generateAccessToken(
    {
      userId: foundUser.user_id,
      username: foundUser.username,
    },
    { expiresIn: "1d" }
  );

  res.cookie("token", accessToken, {
    // httpOnly: true,
    httpOnly: false,
    sameSite: "None",
    secure: true,
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  const responseCode = status.OK;
  return res.status(responseCode).send({
    message: status[responseCode],
    code: responseCode,
    accessToken,
  });
};
