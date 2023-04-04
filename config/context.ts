export const context = {
  account: "01234567890", //Replace with your AWS account ID
  region: "eu-central-1", // Replace according to your account's region
  persistence: {
    bucketName: "payload-bucket"
  },
  messaging: {
    queueName: "favorites-queue"
  }
}
