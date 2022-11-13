import { downloadObject } from "../libs/s3.js";

const downloadObjectByObjectKey = async (req, res, next) => {
  // @TODO: Validate if projectId is uuid
  const { projectId } = req.params;
  const { objectKey } = req.query;
  try {
    const buffer = await downloadObject(`${projectId}/${objectKey}`);
    return res
      .set({
        "content-type": "application/zip",
        "content-disposition": "attachment; filename=file.zip",
      })
      .send(buffer);
  } catch (error) {
    return res.status(500).send({
      code: 500,
      message: error.message,
    });
  }
};

export default {
  downloadObjectByObjectKey,
};
