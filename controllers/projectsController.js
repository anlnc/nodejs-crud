import BPromise from "bluebird";
import status from "http-status";
import AdmZip from "adm-zip";
import prisma from "../functions/prisma.js";
import uploadFileToS3 from "../functions/uploadFileToS3.js";
import fs from "fs";
import { listObjects } from "../libs/s3.js";
import { isFile, isRootFolder } from "../utils/index.js";

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
      project_id: true,
      title: true,
      content: true,
      created_at: true,
      info: true,
      users: {
        select: {
          user_id: true,
          name: true,
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
    return res.status(statusCode).send({
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

const getRecordById = async (req, res, next) => {
  // @TODO: Validate if projectId is uuid
  // @TODO: Check if user trying to fetch a project that is not owned by him/her
  const { projectId } = req.params;
  if (!projectId) {
    const statusCode = status.BAD_REQUEST;
    return res.status(statusCode).send({
      code: statusCode,
      message: status[statusCode],
    });
  }

  const objects = await listObjects(projectId);
  const dispatch = {
    files: [],
    folders: [],
  };
  objects.reduce((dispatch, object) => {
    const { Key: objectKey } = object;
    if (!isRootFolder(objectKey)) {
      isFile(objectKey)
        ? dispatch.files.push({ objectKey })
        : dispatch.folders.push({ objectKey });
    }

    return dispatch;
  }, dispatch);

  return res.send({
    code: 200,
    dispatch,
  });
};

export default {
  getAllRecords,
  createRecord,
  getRecordById,
};
