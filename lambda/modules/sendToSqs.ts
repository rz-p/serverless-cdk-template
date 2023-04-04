import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"

const sqs = new SQSClient({})

export const sendToSqs = async (transformedPayload: unknown) => {
  const queueUrl = process.env.QUEUE_URL

  if (!queueUrl) {
    return {
      sqsError: new Error("Error, cannot find any SQS queue URL")
    }
  }

  const params = {
    MessageBody: JSON.stringify(transformedPayload),
    QueueUrl: queueUrl
  }

  try {
    const sendResult = await sqs.send(new SendMessageCommand(params))
    console.log("Sent to SQS, message id: ", sendResult?.MessageId)
  } catch (e) {
    console.error(e)
    return {
      sqsError: e as Error
    }
  }

  return {
    sqsError: null
  }
}
