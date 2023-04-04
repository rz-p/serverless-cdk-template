#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { context } from "../config/context"
import { ProcessingStack } from "../lib/processing-stack"
import { PersistenceStack } from "../lib/persistence-stack"

const app = new cdk.App()
const processingStack = new ProcessingStack(app, "ProcessingStack", {
  env: {
    account: context.account,
    region: context.region
  },
  bucketName: context.persistence.bucketName,
  queueName: context.messaging.queueName
})

new PersistenceStack(app, "PersistenceStack", {
  env: {
    account: context.account,
    region: context.region
  },
  lambdaRole: processingStack.lambdaRole,
  bucketName: context.persistence.bucketName
})

app.synth()
