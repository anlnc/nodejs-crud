import downloadFileFromS3 from "../functions/downloadFileFromS3.js";

const downloadProjectById = async (req, res, next) => {
  // @TODO: Validate if projectId is uuid
  const { projectId } = req.params;

  try {
    const buffer = await downloadFileFromS3({ projectId });
    return res
      .set({
        "content-type": "application/zip",
        "content-disposition": "attachment; filename=file.zip",
      })
      .send(buffer);
    res.send();
  } catch (error) {
    return res.status(500).send({
      code: 500,
      message: error.message,
    });
  }
};

export default {
  downloadProjectById,
};
