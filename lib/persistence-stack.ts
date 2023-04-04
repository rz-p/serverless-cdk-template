import { Stack, StackProps } from "aws-cdk-lib"
import { IRole } from "aws-cdk-lib/aws-iam"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"

interface BucketStackProps extends StackProps {
  lambdaRole?: IRole
  bucketName: string
}
export class PersistenceStack extends Stack {
  constructor(scope: Construct, id: string, props: BucketStackProps) {
    super(scope, id, props)

    const bucketName = `${props.env?.account}-${props.env?.region}-${props.bucketName}`

    const bucket = new s3.Bucket(this, "S3 Bucket", {
      bucketName,
      enforceSSL: true,
      versioned: true,
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      serverAccessLogsPrefix: "access-logs",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      // Encryption
      encryption: s3.BucketEncryption.S3_MANAGED
    })

    const lambdaExecutionRole = props.lambdaRole

    // Add Permissions
    if (!lambdaExecutionRole) {
      throw new Error("Role undefined!")
    }
    bucket.grantWrite(lambdaExecutionRole)
  }
}
