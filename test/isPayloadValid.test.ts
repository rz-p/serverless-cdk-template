import { APIGatewayProxyEvent } from "aws-lambda"
import { isPayloadValid } from "../lambda/modules/isPayloadValid"
import { testEvent } from "./testData"

test("parse succeed, return null parseError", () => {
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
    ...testEvent,
    body: JSON.stringify({
      favoriteColor: "red",
      favoritePet: "cat",
      favoriteSnacks: snacks,
      favoriteMovies: movies
    })
  }

  const { parseError, isValid } = isPayloadValid(
    inputEvent as unknown as APIGatewayProxyEvent
  )

  expect(parseError).toBe(null)
  expect(isValid).toBe(true)
})

test("no body present, return null", () => {
  const inputEvent = { ...testEvent, body: null }
  const { parseError, isValid } = isPayloadValid(
    inputEvent as unknown as APIGatewayProxyEvent
  )

  expect(parseError).not.toBe(null)
  expect(parseError?.message).toBe("Message Body cannot be empty.")
  expect(isValid).toBe(false)
})

test("parse failed, will return the the failed payload", () => {
  const inputEvent = { ...testEvent, body: "This is failed parsing" }

  const { parseError, isValid } = isPayloadValid(
    inputEvent as unknown as APIGatewayProxyEvent
  )

  expect(parseError).not.toBe(null)
  expect(parseError?.message).toBe("Cannot parse JSON.")
  expect(isValid).toBe(false)
})

test("parse fails if movies are missing", () => {
  const snacks = ["chocolate", "chips"]

  const inputEvent = {
    ...testEvent,
    body: JSON.stringify({
      favoriteColor: "red",
      favoritePet: "cat",
      favoriteSnacks: snacks
    })
  }

  const { parseError, isValid } = isPayloadValid(
    inputEvent as unknown as APIGatewayProxyEvent
  )

  expect(parseError?.message).toBe(
    "Required field favoriteMovies needs to be an array of objects with title (string) and releaseDate (year as number)."
  )
  expect(isValid).toBe(false)
})

test("parse fails, if one item wrong datatype", () => {
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
    ...testEvent,
    body: JSON.stringify({
      favoritePet: 123,
      favoriteSnacks: snacks,
      favoriteMovies: movies
    })
  }

  const { parseError, isValid } = isPayloadValid(
    inputEvent as unknown as APIGatewayProxyEvent
  )

  expect(parseError?.message).toBe(
    "Required field favoritePet is not a string. "
  )
  expect(isValid).toBe(false)
})
