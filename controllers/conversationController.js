import sortBy from "lodash/sortBy.js";
import status from "http-status";
import { generateAccessToken } from "../functions/jwt.js";
import prisma from "../functions/prisma.js";

const createConversation = async (req, res) => {
  const { userId, projectId, content } = req.body;
  if (!userId || !projectId || !content) {
    const responseCode = status.BAD_REQUEST;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }

  const data = {
    content,
    user_id: userId,
    project_id: projectId,
  };
  let responseCode;
  try {
    await prisma.conversations.create({ data });
    responseCode = status.CREATED;
  } catch (error) {
    console.error("Unsuccessfully Created: ", error.message);
    responseCode = status.INTERNAL_SERVER_ERROR;
  } finally {
    await prisma.$disconnect();
  }
  return res.status(responseCode).send({
    message: status[responseCode],
    code: responseCode,
  });
};

const getConversationByProject = async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    const responseCode = status.BAD_REQUEST;
    return res.status(responseCode).send({
      message: status[responseCode],
      code: responseCode,
    });
  }
  const condition = {
    project_id: projectId,
  };
  const conversations = await prisma.conversations
    .findMany({
      where: condition,
      select: {
        content: true,
        created_at: true,
        users: {
          select: {
            user_id: true,
            name: true,
          },
        },
      },
    })
    .then((conversations) => sortBy(conversations, "created_at"));
  return res.send({
    code: 200,
    conversations,
  });
};

export default {
  createConversation,
  getConversationByProject,
};
