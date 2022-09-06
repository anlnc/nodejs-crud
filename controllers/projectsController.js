import status from "http-status";
import prisma from "../functions/prisma.js";

const getAllRecords = async (req, res, next) => {
  const { groupId } = req.user;
  const condition =
    groupId === "11e461c1-8169-4194-9c6b-b9c593aaf74a"
      ? {}
      : {
          group_id: groupId,
        };
  const projects = await prisma.projects.findMany({
    where: condition,
    select: {
      title: true,
      content: true,
      created_at: true,
      info: true,
      users: {
        select: {
          user_id: true,
          fullname: true,
        },
      },
    },
  });
  return res.send({
    code: 200,
    projects,
  });
};

const createRecord = async (req, res, next) => {
  const { userId, groupId } = req.user;
  const { title, content } = req.body;
  const data = {
    content,
    title,
    user_id: userId,
    group_id: groupId,
  };
  await prisma.projects.create({
    data: data,
  });
  const statusCode = status.CREATED;
  return res.send({
    code: statusCode,
    message: status[statusCode],
    data,
  });
};

export default {
  getAllRecords,
  createRecord,
};
