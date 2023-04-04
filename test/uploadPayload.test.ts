import {
  uploadInvalidPayload,
  uploadValidPayload
} from "../lambda/modules/uploadPayload"

jest.mock("aws-sdk", () => {
  return {
    S3: jest.fn(() => ({
      putObject: jest.fn().mockReturnThis(),

      promise: jest.fn()
    }))
  }
})

test("invalid Payload & invalid Bucket", async () => {
  const invalidPayload = { body: "This is invalid Payload" }
  const { uploadSuccess, uploadError } = await uploadInvalidPayload(
    invalidPayload.body
  )

  expect(uploadSuccess).toBe(false)
  expect(uploadError).not.toBe(null)
  expect(uploadError?.message).toBe("Error, cannot find any bucket")
})

test("valid Payload & invalid Bucket", async () => {
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

  const { uploadSuccess, uploadError } = await uploadValidPayload(
    inputEvent.body
  )

  console.log(uploadSuccess)
  expect(uploadSuccess).toBe(false)
  expect(uploadError).not.toBe(null)
  expect(uploadError?.message).toBe("Error, cannot find any bucket")
})

test("invalid Payload & valid Bucket", async () => {
  process.env.BUCKET_NAME = "payload-bucket"

  const invalidPayload = { body: "This is invalid Payload" }

  const { uploadSuccess, uploadError } = await uploadInvalidPayload(
    invalidPayload.body
  )

  expect(uploadSuccess).toBe(true)
  expect(uploadError).toBe(null)
})

test("valid Payload & valid Bucket", async () => {
  process.env.BUCKET_NAME = "payload-bucket"

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

  const { uploadSuccess, uploadError } = await uploadValidPayload(
    inputEvent.body
  )

  expect(uploadSuccess).toBe(true)
  expect(uploadError).toBe(null)
})
