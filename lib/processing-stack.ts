import {
  aws_lambda,
  aws_apigateway,
  Stack,
  StackProps,
  CfnOutput,
  aws_sqs,
  Duration
} from "aws-cdk-lib"
import { IRole } from "aws-cdk-lib/aws-iam"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"

import { Construct } from "constructs"

interface ProcessingStackProps extends StackProps {
  bucketName: string
  queueName: string
}
export class ProcessingStack extends Stack {
  public readonly lambdaRole?: IRole

  constructor(scope: Construct, id: string, props?: ProcessingStackProps) {
    super(scope, id, props)

    //
    // Queue
    //

    const sqsQueue = new aws_sqs.Queue(this, "sqs-queue", {
      queueName: props?.queueName,
      encryption: aws_sqs.QueueEncryption.KMS_MANAGED
    })

    //
    // Lambda
    //

    const lambdaFunction = new NodejsFunction(
      this,
      "Favorite Processing Lambda",
      {
        functionName: "favorite-processor",
        entry: "lambda/processPayload.ts",
        runtime: aws_lambda.Runtime.NODEJS_18_X,
        handler: "handler",
        memorySize: 1024,
        timeout: Duration.minutes(3),
        bundling: {
          minify: true,
          sourceMap: true,
          target: "esnext"
        },
        environment: {
          BUCKET_NAME: `${props?.env?.account}-${props?.env?.region}-${props?.bucketName}}`,
          QUEUE_URL: sqsQueue.queueUrl
        }
      }
    )

    this.lambdaRole = lambdaFunction.role

    if (lambdaFunction.role) {
      sqsQueue.grantSendMessages(lambdaFunction.role)
    }

    //
    // Api Gateway
    //

    const api = new aws_apigateway.RestApi(this, "Favorite Processing API", {
      description: "example api gateway"
    })

    const favouriteResource = api.root.addResource("favorites")

    favouriteResource.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(lambdaFunction, { proxy: true })
    )

    new CfnOutput(this, "apiUrl", { value: api.url })
  }
}
