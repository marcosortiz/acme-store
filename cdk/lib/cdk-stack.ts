import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    // Orders service
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "Orders", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 2, // Default is 1
      taskImageOptions: { 
        image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/orders/"),
        containerPort: 3000 
      },
      
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });

    // Deals service
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "Deals", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 2, // Default is 1
      taskImageOptions: { 
        image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/deals/"),
        containerPort: 3000 
      },
      
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });

    //
    // Order Bot Service
    //
    const orderBotTaskDefinition = new ecs.FargateTaskDefinition(this, 'orderBot', {
      memoryLimitMiB: 512,
      cpu: 256,
    });
    const orderBotContainer = orderBotTaskDefinition.addContainer("orderBot", {
      image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/bots/orders"),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'orderBot'
      })
    });
    const orderBotService = new ecs.FargateService(this, 'orderBotService', {
      cluster: cluster,
      taskDefinition: orderBotTaskDefinition,
      desiredCount: 1,
    });

    //
    // Deal Bot Service
    //
    const dealBotTaskDefinition = new ecs.FargateTaskDefinition(this, 'dealBot', {
      memoryLimitMiB: 512,
      cpu: 256,
    });
    const dealBotContainer = dealBotTaskDefinition.addContainer("dealBot", {
      image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/bots/deals"),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'dealBot'
      })
    });
    const dealBotService = new ecs.FargateService(this, 'dealBotService', {
      cluster: cluster,
      taskDefinition: dealBotTaskDefinition,
      desiredCount: 1,
    });

  }
}
