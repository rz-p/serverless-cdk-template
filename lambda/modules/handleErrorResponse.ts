export const handleErrorResponse = (e: Error) => {
  return {
    statusCode: 500,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      result: "Upload and processing failed!",
      error: e.message
    })
  }
}
