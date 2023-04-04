import { sendToSqs } from "../lambda/modules/sendToSqs"

jest.mock("@aws-sdk/client-sqs", () => {
  return {
    SQSClient: jest.fn(() => ({
      send: jest
        .fn()
        .mockReturnValue(Promise.resolve({ MessageId: "testMessageId" }))
    })),
    SendMessageCommand: jest.fn(() => jest.fn().mockReturnThis())
  }
})

test("invalid URL", async () => {
  const transformedPayload = { body: "This is transformed Payload" }
  const { sqsError } = await sendToSqs(transformedPayload.body)

  expect(sqsError).not.toBe(null)
  expect(sqsError?.message).toBe("Error, cannot find any SQS queue URL")
})

test("valid URL & success send", async () => {
  process.env.QUEUE_URL =
    "https://sqs.eu-central-1.amazonaws.com/000000000000/testQueue"

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

  const inputEvent = {
    body: JSON.stringify({
      favoriteColor: "red",
      favoritePet: "cat",
      favoriteSnacks: snacks,
      favoriteMovies: movies
    })
  }

  const { sqsError } = await sendToSqs(inputEvent.body)

  expect(sqsError).toBe(null)
})
