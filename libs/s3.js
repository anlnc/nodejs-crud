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

export const listObjects = async (projectId) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delimiter: "",
    Prefix: projectId,
  };
  try {
    const response = await s3.listObjects(params).promise();
    return response.Contents;
  } catch (error) {
    console.error("COULD NOT GET OBJECTS: ", error.message);
    throw new Error(`COULD NOT GET OBJECTS: ${error.message}`);
  }
};

export const downloadObject = async (objectKey) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: objectKey,
  };

  try {
    const response = await s3.getObject(params).promise();
    return response.Body;
  } catch (error) {
    console.error("COULD NOT DOWNLOADED FROM S3: ", error.message);
    throw new Error(`COULD NOT DOWNLOADED FROM S3: ${error.message}`);
  }
};
