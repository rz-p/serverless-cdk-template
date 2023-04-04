import { transformPayload } from "../lambda/modules/transformPayload"
import { Payload } from "../lambda/processPayload"
import { testEvent } from "./testData"

test("transform payload success, return transformed payload", () => {
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

  // eslint-disable-next-line
  const parsedPayload = JSON.parse(inputEvent.body)
  const { getTime, getDate, getMonth, getFullYear } = new Date()
  const { transformError, transformed } = transformPayload(
    parsedPayload as unknown as Payload
  )

  expect(transformError).toBe(null)
  expect(transformed?.timeStamp.getDate).toBe(getDate)
  expect(transformed?.timeStamp.getMonth).toBe(getMonth)
  expect(transformed?.timeStamp.getFullYear).toBe(getFullYear)
  expect(transformed?.timeStamp.getTime).toBe(getTime)
  expect(transformed?.pet).toBe("cat")
  expect(transformed?.snacks).toStrictEqual(snacks)
  expect(transformed?.movies).toStrictEqual(movies)
})

test("transform error, return null", () => {
  const inputEvent = {
    ...testEvent,
    body: null
  }

  const parsedPayload = inputEvent.body
  const { transformError, transformed } = transformPayload(
    parsedPayload as unknown as Payload
  )

  expect(transformError?.message).toBe("Transformation Error")
  expect(transformed).toBe(null)
})
