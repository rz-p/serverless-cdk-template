import { APIGatewayEvent } from "aws-lambda"
import { handleErrorResponse } from "./modules/handleErrorResponse"
import { isPayloadValid } from "./modules/isPayloadValid"
import {
  uploadInvalidPayload,
  uploadValidPayload
} from "./modules/uploadPayload"
import { sendToSqs } from "./modules/sendToSqs"
import { transformPayload } from "./modules/transformPayload"

export type { Payload }

type Movies = {
  title: string
  releaseDate: number
}

type Payload = {
  favoriteColor: string
  favoritePet: string
  favoriteSnacks: string[]
  favoriteMovies: Movies[]
}

export const handler = async (event: APIGatewayEvent) => {
  // INPUT VALIDATION
  const { parseError, isValid } = isPayloadValid(event)
  if (!isValid && parseError) {
    await uploadInvalidPayload(event.body)
    return handleErrorResponse(parseError)
  }

  // UPLOAD TO S3
  const parsedPayload = JSON.parse(event.body as string)
  const { uploadSuccess, uploadError } = await uploadValidPayload(parsedPayload)
  if (!uploadSuccess && uploadError) {
    return handleErrorResponse(uploadError)
  }

  // TRANSFORM PAYLOAD
  const { transformError, transformed } = transformPayload(parsedPayload)
  if (transformError) {
    return handleErrorResponse(transformError)
  }

  // SEND TO SQS
  const { sqsError } = await sendToSqs(transformed)
  if (sqsError) {
    return handleErrorResponse(sqsError)
  }

  return {
    statusCode: 200,
    body: "accepted"
  }
}
