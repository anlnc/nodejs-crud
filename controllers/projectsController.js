import BPromise from "bluebird";
import status from "http-status";
import AdmZip from "adm-zip";
import prisma from "../functions/prisma.js";
import uploadFileToS3 from "../functions/uploadFileToS3.js";
import fs from "fs";

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
  const BASE_FOLDER = `./${projectId}`;
  const ZIP_FILE = `${BASE_FOLDER}/file.zip`;
  await fs.promises.mkdir(BASE_FOLDER);
  try {
    await BPromise.map(
      files,
      async (file) => {
        const { fileName, base64 } = file;
        const fileContent = Buffer.from(
          base64.toString().replace(/^data:\w+\/.+?;base64,/, ""),
          "base64"
        );
        await fs.promises.writeFile(`${BASE_FOLDER}/${fileName}`, fileContent);
      },
      { concurrency: 4 }
    );

    const zip = new AdmZip();
    zip.addLocalFolder(BASE_FOLDER);
    zip.writeZip(ZIP_FILE);
    const zipBuffer = fs.readFileSync(ZIP_FILE);
    await uploadFileToS3({
      fileKey: `${projectId}/file.zip`,
      buffer: zipBuffer,
    });
    await fs.promises.rm(BASE_FOLDER, { recursive: true });

    const statusCode = status.CREATED;
    return res.send({
      code: statusCode,
      message: status[statusCode],
      data,
    });
  } catch (error) {
    console.log("COULD NOT UPLOAD: ", error.message);
    await prisma.projects.delete({
      where: {
        project_id: projectId,
      },
    });
    await fs.promises.rm(BASE_FOLDER, { recursive: true });

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
