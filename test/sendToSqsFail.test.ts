import { sendToSqs } from "../lambda/modules/sendToSqs"

jest.mock("@aws-sdk/client-sqs", () => {
  return {
    SQSClient: jest.fn(() => ({
      send: jest
        .fn()
        .mockReturnValue(Promise.reject(new Error("sqs send failed")))
    })),
    SendMessageCommand: jest.fn(() => jest.fn().mockReturnThis())
  }
})

test("valid URL & failed send", async () => {
  process.env.QUEUE_URL =
    "https://sqs.eu-central-1.amazonaws.com/000000000000/testQueue"

  const inputEvent = {
    body: null
  }

  const { sqsError } = await sendToSqs(inputEvent.body)

  expect(sqsError).not.toBe(null)
  expect(sqsError?.message).toBe("sqs send failed")
})
