import {
  uploadInvalidPayload,
  uploadValidPayload
} from "../lambda/modules/uploadPayload"
import { isPayloadValid } from "../lambda/modules/isPayloadValid"
import { handler } from "../lambda/processPayload"
import { testEvent } from "./testData"
import { sendToSqs } from "../lambda/modules/sendToSqs"
import { APIGatewayProxyEvent } from "aws-lambda"
import { transformPayload } from "../lambda/modules/transformPayload"

process.env.BUCKET_NAME = "payload-bucket"
process.env.QUEUE_URL =
  "https://sqs.eu-central-1.amazonaws.com/814530382663/testQueue"
const snacks = ["chocolate", "chips"]
const movies = [
  {
    title: "Tenet",
    releaseDate: 2022
  },
  {
    title: "Jurassic Park",
    releaseDate: 1993
  }
]

jest.mock("aws-sdk", () => {
  return {
    config: { update: jest.fn() },
    S3: jest.fn(() => ({
      putObject: jest.fn().mockReturnThis(),
      promise: jest.fn()
    }))
  }
})

jest.mock("../lambda/modules/isPayloadValid")
jest.mock("../lambda/modules/uploadPayload")
jest.mock("../lambda/modules/transformPayload")
jest.mock("../lambda/modules/sendToSqs")

const mockedValidatePayload = jest.mocked(isPayloadValid, { shallow: true })
const mockedUploadInvalid = jest.mocked(uploadInvalidPayload, { shallow: true })
const mockedUploadValid = jest.mocked(uploadValidPayload, { shallow: true })
const mockedTransformPayload = jest.mocked(transformPayload, { shallow: true })
const mockedSendToSqs = jest.mocked(sendToSqs, { shallow: true })

test("handler: upload invalid Payload", async () => {
  const inputEvent = { ...testEvent, body: "This is invalid Payload" }

  mockedValidatePayload.mockReturnValue({
    isValid: false,
    parseError: new Error("something went wrong")
  })

  mockedUploadInvalid.mockReturnValue(
    Promise.resolve({
      uploadSuccess: true,
      uploadError: null
    })
  )

  const result = await handler(inputEvent as unknown as APIGatewayProxyEvent)

  expect(result).not.toBeNull()
  expect(result.statusCode).toBe(500)
  expect(result.body).toBe(
    '{"result":"Upload and processing failed!","error":"something went wrong"}'
  )
})

test("handler: upload valid Payload and send to SQS", async () => {
  const inputEvent = {
    ...testEvent,
    body: JSON.stringify({
      favoriteColor: "red",
      favoritePet: "cat",
      favoriteSnacks: snacks,
      favoriteMovies: movies
    })
  }

  mockedValidatePayload.mockReturnValue({
    isValid: true,
    parseError: null
  })

  mockedUploadValid.mockReturnValue(
    Promise.resolve({
      uploadSuccess: true,
      uploadError: null
    })
  )

  mockedTransformPayload.mockReturnValue({
    transformed: {
      pet: "cats",
      snacks,
      movies,
      timeStamp: new Date("2021-01-01T00:00:00.000Z")
    },
    transformError: null
  })

  mockedSendToSqs.mockReturnValue(
    Promise.resolve({
      body: "Success",
      sqsError: null
    })
  )

  const result = await handler(inputEvent as unknown as APIGatewayProxyEvent)

  expect(result).not.toBeNull()
  expect(result.statusCode).toBe(200)
  expect(result.body).toBe("accepted")
})

test("handler: upload valid Payload fails", async () => {
  const inputEvent = { ...testEvent }

  mockedValidatePayload.mockReturnValue({
    isValid: true,
    parseError: null
  })

  mockedUploadValid.mockReturnValue(
    Promise.resolve({
      uploadSuccess: false,
      uploadError: new Error("Upload error!")
    })
  )

  const result = await handler(inputEvent as unknown as APIGatewayProxyEvent)

  expect(result).not.toBeNull()
  expect(result.statusCode).toBe(500)
  expect(result.body).toBe(
    '{"result":"Upload and processing failed!","error":"Upload error!"}'
  )
})

test("handler: transformation fails", async () => {
  const inputEvent = { ...testEvent }

  mockedValidatePayload.mockReturnValue({
    isValid: true,
    parseError: null
  })

  mockedUploadValid.mockReturnValue(
    Promise.resolve({
      uploadSuccess: true,
      uploadError: null
    })
  )

  mockedTransformPayload.mockReturnValue({
    transformError: new Error("Transform error!"),
    transformed: null
  })

  const result = await handler(inputEvent as unknown as APIGatewayProxyEvent)

  expect(result).not.toBeNull()
  expect(result.statusCode).toBe(500)
  expect(result.body).toBe(
    '{"result":"Upload and processing failed!","error":"Transform error!"}'
  )
})

test("handler: sqs send fails", async () => {
  const inputEvent = { ...testEvent }

  mockedValidatePayload.mockReturnValue({
    isValid: true,
    parseError: null
  })

  mockedUploadValid.mockReturnValue(
    Promise.resolve({
      uploadSuccess: true,
      uploadError: null
    })
  )

  mockedTransformPayload.mockReturnValue({
    transformed: {
      pet: "cats",
      snacks,
      movies,
      timeStamp: new Date("2021-01-01T00:00:00.000Z")
    },
    transformError: null
  })

  mockedSendToSqs.mockReturnValue(
    Promise.resolve({
      sqsError: new Error("SQS error!"),
      body: null
    })
  )

  const result = await handler(inputEvent as unknown as APIGatewayProxyEvent)

  expect(result).not.toBeNull()
  expect(result.statusCode).toBe(500)
  expect(result.body).toBe(
    '{"result":"Upload and processing failed!","error":"SQS error!"}'
  )
})
