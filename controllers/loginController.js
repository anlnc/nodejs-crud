import { compare } from "bcrypt";
import status from "http-status";
import { generateAccessToken } from "../functions/jwt.js";
import prisma from "../functions/prisma.js";

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const responseCode = status.BAD_REQUEST;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
  let foundUser;
  try {
    foundUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error(`[ERROR] ${error.message}`);
    const responseCode = status.INTERNAL_SERVER_ERROR;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }

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
  const userId = foundUser.user_id;
  const groupId = foundUser.group_id;
  const accessToken = generateAccessToken(
    {
      userId,
      groupId,
    },
    { expiresIn: "1d" }
  );

  const responseCode = status.OK;
  return res.status(responseCode).send({
    message: status[responseCode],
    code: responseCode,
    accessToken,
    userId,
  });
};
