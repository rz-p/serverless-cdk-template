import { APIGatewayEvent } from "aws-lambda"
import type { Payload } from "../processPayload"

function isString(item: unknown) {
  return typeof item === "string"
}

function isStringArray(item: unknown) {
  if (Array.isArray(item)) {
    return item.every((thingInArray) => typeof thingInArray === "string")
  } else {
    return false
  }
}

function isMovieArray(item: unknown) {
  if (Array.isArray(item)) {
    return item.every((thingInItem) => {
      const hasTitle =
        Object.prototype.hasOwnProperty.call(thingInItem, "title") &&
        typeof thingInItem.title === "string"
      const hasReleaseDate =
        Object.prototype.hasOwnProperty.call(thingInItem, "releaseDate") &&
        typeof thingInItem.releaseDate === "number"
      return hasTitle && hasReleaseDate
    })
  } else {
    return false
  }
}

export const isPayloadValid = (event: APIGatewayEvent) => {
  const body = event.body

  if (!body) {
    return {
      isValid: false,
      parseError: new Error("Message Body cannot be empty.")
    }
  }

  let payload: Payload
  try {
    payload = JSON.parse(body)
  } catch (e) {
    return {
      isValid: false,
      parseError: new Error("Cannot parse JSON.")
    }
  }

  let validationErrorText = ""
  let isValid = true
  if (!isString(payload.favoritePet)) {
    isValid = false
    validationErrorText =
      validationErrorText + "Required field favoritePet is not a string. "
  }

  if (!isStringArray(payload.favoriteSnacks)) {
    isValid = false
    validationErrorText =
      validationErrorText +
      "Required field favoriteSnacks is not a string array. "
  }

  if (!isMovieArray(payload.favoriteMovies)) {
    isValid = false
    validationErrorText =
      validationErrorText +
      "Required field favoriteMovies needs to be an array of objects with title (string) and releaseDate (year as number)."
  }

  if (!isValid) {
    return {
      isValid,
      parseError: new Error(validationErrorText)
    }
  }

  return {
    isValid,
    parseError: null
  }
}
