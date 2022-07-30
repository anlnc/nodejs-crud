import fs from "fs";
import status from "http-status";
import { PrismaClient } from "@prisma/client";

// const getRecordById = async (req, res) => {
//   const {
//     params: { id: postId },
//   } = req;
//   const post = posts.find((post) => post.post_id === postId);
//   if (!post) {
//     const responseCode = status.NOT_FOUND;
//     return res.status(responseCode).send({
//       message: status[responseCode],
//       code: responseCode,
//     });
//   }
//   return res.send({
//     post,
//   });
// };

const getAllRecords = async (req, res, next) => {
  const { userId, isAdmin } = req.user;
  const prisma = new PrismaClient();
  const condition = isAdmin
    ? {}
    : {
        owner_id: userId,
      };
  const records = await prisma.record.findMany({
    where: condition,
  });
  await prisma.$disconnect();
  return res.send({
    code: 200,
    records,
  });
};

const createRecord = async (req, res, next) => {
  const { userId, username, isAdmin } = req.user;
  const { title, content } = req.body;
  const prisma = new PrismaClient();
  const data = {
    content,
    title,
    owner_id: userId,
  };
  await prisma.record.create({
    data: data,
  });
  await prisma.$disconnect();
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
