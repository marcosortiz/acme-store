import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as apigateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha';
import { HttpNlbIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpUserPoolAuthorizer, HttpJwtAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as path from 'path';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //-------------------------------------------------------------------------
    // VPC
    //-------------------------------------------------------------------------
    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    
    //-------------------------------------------------------------------------
    // ECS Cluster
    //-------------------------------------------------------------------------
    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });


    //-------------------------------------------------------------------------
    // Orders service
    //-------------------------------------------------------------------------
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


    //-------------------------------------------------------------------------
    // Deals service
    //-------------------------------------------------------------------------
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


    // //
    // // Order Bot Service
    // //
    // const orderBotTaskDefinition = new ecs.FargateTaskDefinition(this, 'orderBot', {
    //   memoryLimitMiB: 512,
    //   cpu: 256,
    // });
    // const orderBotContainer = orderBotTaskDefinition.addContainer("orderBot", {
    //   image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/bots/orders"),
    //   logging: new ecs.AwsLogDriver({
    //     streamPrefix: 'orderBot'
    //   })
    // });
    // const orderBotService = new ecs.FargateService(this, 'orderBotService', {
    //   cluster: cluster,
    //   taskDefinition: orderBotTaskDefinition,
    //   desiredCount: 1,
    // });

    // //
    // // Deal Bot Service
    // //
    // const dealBotTaskDefinition = new ecs.FargateTaskDefinition(this, 'dealBot', {
    //   memoryLimitMiB: 512,
    //   cpu: 256,
    // });
    // const dealBotContainer = dealBotTaskDefinition.addContainer("dealBot", {
    //   image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/src/bots/deals"),
    //   logging: new ecs.AwsLogDriver({
    //     streamPrefix: 'dealBot'
    //   })
    // });
    // const dealBotService = new ecs.FargateService(this, 'dealBotService', {
    //   cluster: cluster,
    //   taskDefinition: dealBotTaskDefinition,
    //   desiredCount: 1,
    // });


    //-------------------------------------------------------------------------
    // Cognito User Pool and Identity Pool
    //-------------------------------------------------------------------------
    const userPool = new cognito.UserPool(this, 'acmestoreUserPool', {
      removalPolicy: RemovalPolicy.DESTROY
    });
    const cognitoAppClientId = userPool.addClient('acmestore');
    const identityPool = new IdentityPool(this, 'acmestoreIdentityPool', {
      allowClassicFlow: false,
      authenticationProviders: {
        userPools: [new UserPoolAuthenticationProvider({ 
          userPool: userPool,
          userPoolClient: cognitoAppClientId,
        })],
      },
    });

    const adminUserPoolGroup = new cognito.CfnUserPoolGroup(this, 'AdminUserPoolGroup', {
      userPoolId: userPool.userPoolId,
      description: 'Can Access deals and orders API',
      groupName: 'Admin',
      precedence: 1,
    });
    const readUserPoolGroup = new cognito.CfnUserPoolGroup(this, 'ReadUserPoolGroup', {
      userPoolId: userPool.userPoolId,
      description: 'Can only access deals API',
      groupName: 'Deals',
      precedence: 2,
    });

    const preTokenAuthLambdaFn = new lambda.Function(this, 'AcmeStorePreTokenAuth', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'src', 'preAuthTriggerLambda')),
    });
    userPool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, preTokenAuthLambdaFn);


    //-------------------------------------------------------------------------
    // Acme Bots API
    //-------------------------------------------------------------------------
    const ordersIntegration = new HttpNlbIntegration('OrdersIntegration', ordersService.listener);
    const dealsIntegration = new HttpNlbIntegration('DealsIntegration', dealsService.listener);
    const httpUserPoolAuth = new HttpUserPoolAuthorizer('AcmeStoreJwtAuth', userPool, {
      identitySource: ['$request.header.Authorization'],
      userPoolClients: [cognitoAppClientId]
    });
    const readOnlyScope = `${readUserPoolGroup.groupName}-${cognitoAppClientId.userPoolClientId}`;
    const adminScope = `${adminUserPoolGroup.groupName}-${cognitoAppClientId.userPoolClientId}`;

    const httpApi = new apigateway.HttpApi(this, 'AcmeStore', {
      disableExecuteApiEndpoint: false,
      defaultIntegration: ordersIntegration,
      defaultAuthorizer: httpUserPoolAuth,
      defaultAuthorizationScopes: [readOnlyScope, adminScope],
    });
    httpApi.addRoutes({
      path: '/',
      methods: [ apigateway.HttpMethod.GET ],
      integration: ordersIntegration,
      authorizer: new apigateway.HttpNoneAuthorizer,
      authorizationScopes: []
    });
    httpApi.addRoutes({
      path: '/orders',
      methods: [ apigateway.HttpMethod.GET ],
      integration: ordersIntegration,
      authorizationScopes: [adminScope],
    });
    httpApi.addRoutes({
      path: '/orders/{orderID}',
      methods: [ apigateway.HttpMethod.GET ],
      integration: ordersIntegration,
      authorizationScopes: [adminScope],
    });
    httpApi.addRoutes({
      path: '/orders',
      methods: [ apigateway.HttpMethod.POST ],
      integration: ordersIntegration,
      authorizationScopes: [adminScope],
    });
    httpApi.addRoutes({
      path: '/deals',
      methods: [ apigateway.HttpMethod.GET ],
      integration: dealsIntegration,
    });
    httpApi.addRoutes({
      path: '/deals/{dealID}',
      methods: [ apigateway.HttpMethod.GET ],
      integration: dealsIntegration
    });
    httpApi.addRoutes({
      path: '/deals',
      methods: [ apigateway.HttpMethod.POST ],
      integration: dealsIntegration
    });


    //-------------------------------------------------------------------------
    // Adding CDK Stack outputs
    //-------------------------------------------------------------------------
    new CfnOutput(this, 'userPoolId', {
      value: userPool.userPoolId,
      description: 'The Congnito User Pool Id.',
      exportName: 'userPoolId',
    });
    new CfnOutput(this, 'identityPoolId', {
      value: identityPool.identityPoolId,
      description: 'The Congnito Identity Pool Id.',
      exportName: 'identityPoolId',
    });
    new CfnOutput(this, 'ClientId', {
      value: cognitoAppClientId.userPoolClientId,
      description: 'The Congnito Identity Pool App Client Id.',
      exportName: 'ClientId',
    });
  }
}