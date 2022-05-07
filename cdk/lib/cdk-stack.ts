import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
// import * as ecr from "aws-cdk-lib/aws-ecr-assets";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
// import * as path from 'path';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    // const serviceA = new ecr.DockerImageAsset(this, 'ServiceA', {
    //   directory: path.join(__dirname, '..', '..','services','serviceA'),
    //   networkMode: ecr.NetworkMode.HOST,
    // });

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 6, // Default is 1
      // taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") },
      
      // taskImageOptions: { image: ecs.ContainerImage.fromDockerImageAsset(serviceA) },
      taskImageOptions: { 
        image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/services/serviceA/"),
        containerPort: 3000 
      },
      
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });
  }
}
