import BPromise from "bluebird";
import status from "http-status";
import prisma from "../functions/prisma.js";
import uploadFileToS3 from "../functions/uploadFileToS3.js";

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
  try {
    const { userId, groupId } = req.user;
    const { title, content, files = [] } = req.body;
    const info = files.map((file) => {
      const { fileName, description } = file;
      return {
        fileName,
        description,
      };
    });
    const data = {
      content,
      title,
      user_id: userId,
      group_id: groupId,
      info,
    };
    const { project_id: projectId } = await prisma.projects.create({
      data: data,
    });

    await BPromise.mapSeries(files, async (file) => {
      const { fileName, base64 } = file;
      await uploadFileToS3({ fileKey: `${fileName}`, base64 });
    });

    const statusCode = status.CREATED;
    return res.send({
      code: statusCode,
      message: status[statusCode],
      data,
    });
  } catch (error) {
    // delde created projected
    const statusCode = status.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).send({
      code: statusCode,
      message: JSON.stringify(error.message),
    });
  }
};

export default {
  getAllRecords,
  createRecord,
};
