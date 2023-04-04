import type { Payload } from "../processPayload"

export const transformPayload = (payload: Payload) => {
  try {
    const transformed = {
      pet: payload.favoritePet,
      snacks: payload.favoriteSnacks,
      movies: payload.favoriteMovies,
      timeStamp: new Date()
    }

    return {
      transformError: null,
      transformed: transformed
    }
  } catch (e) {
    return {
      transformError: new Error("Transformation Error"),
      transformed: null
    }
  }
}
