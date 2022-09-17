import AWS from "aws-sdk";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

// const credentials = new AWS.SharedIniFileCredentials({
//   profile: "personal-account",
// });
// AWS.config.credentials = credentials;

const s3 = new AWS.S3();
// console.log(AWS.config);

const downloadFileFromS3 = async ({ projectId }) => {
  const fileKey = `${projectId}/file.zip`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
  };

  try {
    const response = await s3.getObject(params).promise();
    console.log("FILE DOWNLOADED: ", response);
    // await fs.promises.writeFile("file.zip", response.Body);
    return response.Body;
  } catch (error) {
    console.error("COULD NOT DOWNLOADED FROM S3: ", error.message);
    throw new Error(`COULD NOT DOWNLOADED FROM S3: ${error.message}`);
  }
};

export default downloadFileFromS3;
