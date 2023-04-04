import * as aws from "aws-sdk"
import { generateFileName } from "./generateFileName"

const s3 = new aws.S3()

export const uploadInvalidPayload = async (payload: unknown) => {
  const path = "invalidPayload/"
  const extension = "txt"
  return await uploadPayload(payload, path, extension)
}

export const uploadValidPayload = async (payload: unknown) => {
  const path = "validPayload/"
  const extension = "json"
  return await uploadPayload(payload, path, extension)
}

export const uploadPayload = async (
  payload: unknown,
  path: string,
  extension: string
) => {
  const bucketName = process.env.BUCKET_NAME

  if (!bucketName) {
    return {
      uploadSuccess: false,
      uploadError: new Error("Error, cannot find any bucket")
    }
  }

  const fileName = path + generateFileName(extension)
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: JSON.stringify(payload),
    ContentType: "application/json"
  }
  try {
    await s3.putObject(params).promise()
  } catch (e) {
    return {
      uploadSuccess: false,
      uploadError: e as Error
    }
  }

  return {
    uploadSuccess: true,
    uploadError: null
  }
}
