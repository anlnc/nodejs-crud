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

const uploadFileToS3 = async ({ fileKey, base64 }) => {
  const fileContent = Buffer.from(
    base64.toString().replace(/^data:\w+\/.+?;base64,/, ""),
    "base64"
  );
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: fileContent,
  };

  console.log({ Bucket: process.env.AWS_BUCKET_NAME, Key: fileKey });
  // console.log(params);

  try {
    const response = await s3.upload(params).promise();
    console.log("FILE UPLOADED: ", response);
  } catch (error) {
    console.error("COULD NOT UPLOAD TO S3: ", error.message);
    throw new Error(`COULD NOT UPLOAD TO S3: ${error.message}`);
  }
};

export default uploadFileToS3;
