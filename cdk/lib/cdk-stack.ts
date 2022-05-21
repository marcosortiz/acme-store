import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
// import * as apigateway from "aws-cdk-lib/aws-apigateway";

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
    const ordersService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'Orders', {
      cluster: cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 2, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/orders/"),
        containerPort: 3000 
      },
      publicLoadBalancer: false // Default is false
    });
    ordersService.targetGroup.configureHealthCheck({
      port: '3000'
    });
    ordersService.service.connections.securityGroups[0].addIngressRule(
      ec2.Peer.ipv4('10.0.0.0/16'), ec2.Port.tcp(3000), 'NLB'
    );

    // Deals service
    const dealsService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'Deals', {
      cluster: cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 2, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/deals/"),
        containerPort: 3000 
      },
      publicLoadBalancer: false // Default is false
    });
    dealsService.targetGroup.configureHealthCheck({
      port: '3000'
    });
    dealsService.service.connections.securityGroups[0].addIngressRule(
      ec2.Peer.ipv4('10.0.0.0/16'), ec2.Port.tcp(3000), 'NLB'
    );

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

    // // Acme Bots API
    // const acmeStore = new apigateway.RestApi(this, 'acme-store');
    // acmeStore.root.addMethod('GET');
    // const orders = acmeStore.root.addResource('orders');
    // orders.addMethod('GET');
    // const order = orders.addResource('{order_id}');
    // order.addMethod('GET');

    // const link = new apigateway.VpcLink(this, 'link', {
    //   targets: [ordersService.loadBalancer],
    // });
    
    // const integration = new apigateway.Integration({
    //   type: apigateway.IntegrationType.HTTP_PROXY,
    //   options: {
    //     connectionType: apigateway.ConnectionType.VPC_LINK,
    //     vpcLink: link,
    //   },
    // });


  }
}
