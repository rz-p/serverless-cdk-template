import * as cdk from "aws-cdk-lib"
import { Template } from "aws-cdk-lib/assertions"
import { ProcessingStack } from "../lib/processing-stack"
import { PersistenceStack } from "../lib/persistence-stack"

const testContext = {
  account: "test-account",
  region: "test-region",
  persistence: {
    bucketName: "test-bucket"
  },
  messaging: {
    queueName: "test-queue"
  }
}

test("Lambda Created", () => {
  const app = new cdk.App()
  // WHEN
  const stack = new ProcessingStack(app, "ProcessingTestStack")
  // THEN
  const template = Template.fromStack(stack)
  template.hasResourceProperties("AWS::Lambda::Function", {
    FunctionName: "favorite-processor"
  })
})

test("Api Gateway Created", () => {
  const app = new cdk.App()
  // WHEN
  const stack = new ProcessingStack(app, "ProcessingTestStack")
  // THEN
  const template = Template.fromStack(stack)
  template.hasResourceProperties("AWS::ApiGateway::RestApi", {
    Name: "Favorite Processing API"
  })
})

test("S3 Bucket Created", () => {
  const app = new cdk.App()
  const lambdaStack = new ProcessingStack(app, "ProcessingStack", {
    env: {
      account: testContext.account,
      region: testContext.region
    },
    bucketName: testContext.persistence.bucketName,
    queueName: testContext.messaging.queueName
  })
  const bucketStack = new PersistenceStack(app, "PersistenceTestStack", {
    env: {
      account: testContext.account,
      region: testContext.region
    },
    bucketName: testContext.persistence.bucketName,
    lambdaRole: lambdaStack.lambdaRole
  })

  const template = Template.fromStack(bucketStack)
  template.hasResourceProperties("AWS::S3::Bucket", {
    BucketName: "test-account-test-region-test-bucket"
  })
})

test("SQS Created", () => {
  const app = new cdk.App()
  // WHEN
  const stack = new ProcessingStack(app, "ProcessingStack", {
    env: {
      account: testContext.account,
      region: testContext.region
    },
    bucketName: testContext.persistence.bucketName,
    queueName: testContext.messaging.queueName
  })
  // THEN
  const template = Template.fromStack(stack)
  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "test-queue"
  })
})

test("Persistence stack fails without lambda role", () => {
  const app = new cdk.App()
  try {
    new PersistenceStack(app, "PersistenceTestStack", {
      env: {
        account: testContext.account,
        region: testContext.region
      },
      bucketName: testContext.persistence.bucketName,
      lambdaRole: undefined
    })
  } catch (e) {
    expect((e as Error).message).toBe("Role undefined!")
  }
})
