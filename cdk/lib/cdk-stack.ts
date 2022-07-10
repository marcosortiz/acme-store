import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as rds from 'aws-cdk-lib/aws-rds';
import * as apigateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
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
    const bastionSecurityGroup = new ec2.SecurityGroup(this, 'auroraClients', {
      vpc,
      description: 'Any client app that needs to access Aurora DB',
      allowAllOutbound: true   // Can be set to false
    });

    const host = new ec2.BastionHostLinux(this, 'BastionHost', { 
      vpc: vpc,
      securityGroup: bastionSecurityGroup,
    });
    

    //-------------------------------------------------------------------------
    // Aurora Cluster
    //-------------------------------------------------------------------------
    const auroraCluster = new rds.DatabaseCluster(this, 'AcmeStoreAurora', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_13_6 }),
      credentials: rds.Credentials.fromGeneratedSecret('acmestoreadmin'), // Optional - will default to 'admin' username and generated password
      instanceProps: {
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        vpc,
      },
    });
    auroraCluster.connections.allowFrom(bastionSecurityGroup, ec2.Port.tcp(5432));

    
    //-------------------------------------------------------------------------
    // ECS Cluster
    //-------------------------------------------------------------------------
    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });


    //-------------------------------------------------------------------------
    // Orders service
    //-------------------------------------------------------------------------
    const dbUsername = secretsmanager.Secret.fromSecretNameV2(this, 'username', `${auroraCluster.secret?.secretName}`);
    const dbPassword = secretsmanager.Secret.fromSecretNameV2(this, 'password', `${auroraCluster.secret?.secretName}`);

    const ordersService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'Orders', {
      cluster: cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 2, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("../services/orders/"),
        containerPort: 3000,
        environment: {
          PGHOST: auroraCluster.clusterEndpoint.hostname,
          PGPORT: auroraCluster.clusterEndpoint.port.toString(),
          PGDATABASE: "acme_store_orders",
        },
        secrets: {
          PGUSER: ecs.Secret.fromSecretsManager(dbUsername, 'username'),
          PGPASSWORD: ecs.Secret.fromSecretsManager(dbPassword, 'password'),
        }
      },
      publicLoadBalancer: false // Default is false
    });
    ordersService.targetGroup.configureHealthCheck({
      port: '3000'
    });
    ordersService.service.connections.securityGroups[0].addIngressRule(
      ec2.Peer.ipv4('10.0.0.0/16'), ec2.Port.tcp(3000), 'NLB'
    );
    auroraCluster.connections.allowFrom(ordersService.service.connections.securityGroups[0], ec2.Port.tcp(5432));


    //-------------------------------------------------------------------------
    // Deals service
    //-------------------------------------------------------------------------
    const dealsService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'Deals', {
      cluster: cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 2, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("../services/deals/"),
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
    // // Deal Bot Service
    // //
    // const dealBotTaskDefinition = new ecs.FargateTaskDefinition(this, 'dealBot', {
    //   memoryLimitMiB: 512,
    //   cpu: 256,
    // });
    // const dealBotContainer = dealBotTaskDefinition.addContainer("dealBot", {
    //   image: ecs.ContainerImage.fromAsset("/Users/ormarcos/dev/aws-containers-labs/services/bots/deals"),
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

    const adminUsersecret = new secretsmanager.Secret(this, 'AdminUser', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'Admin' }),
        generateStringKey: 'password',
      },
    });
    const readOnlyUsersecret = new secretsmanager.Secret(this, 'ReadOnlyUser', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'ReadOnly' }),
        generateStringKey: 'password',
      },
    });
    
    const preTokenAuthLambdaFn = new lambda.Function(this, 'AcmeStorePreTokenAuth', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'services', 'preAuthTriggerLambda')),
    });
    userPool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, preTokenAuthLambdaFn);


    //-------------------------------------------------------------------------
    // Acme Store API
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
      path: '/orders/{orderID}',
      methods: [ apigateway.HttpMethod.DELETE ],
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
    // Order Bot Service
    //-------------------------------------------------------------------------
    // const userPassword = secretsmanager.Secret.fromSecretNameV2(this, 'userPassword', adminUsersecret.secretName);
    const ordersBotUserSecret = secretsmanager.Secret.fromSecretNameV2(this, 'ordersBotUserSecret', adminUsersecret.secretName);
    const orderBotTaskDefinition = new ecs.FargateTaskDefinition(this, 'orderBot', {
      memoryLimitMiB: 512,
      cpu: 256,
    });
    const orderBotContainer = orderBotTaskDefinition.addContainer("orderBot", {
      image: ecs.ContainerImage.fromAsset("../services/bots/orders"),
      environment: {
        REGION: Stack.of(this).region,
        ENDPOINT: httpApi.apiEndpoint,
        USER_POOL_ID: userPool.userPoolId,
        CLIENT_ID: cognitoAppClientId.userPoolClientId,
        IDENTITY_POOL_ID: identityPool.identityPoolId,
      },
      secrets: {
        USERNAME: ecs.Secret.fromSecretsManager(ordersBotUserSecret, 'username'),
        PASSWORD: ecs.Secret.fromSecretsManager(ordersBotUserSecret, 'password'),
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'orderBot'
      })
    });
    const orderBotService = new ecs.FargateService(this, 'orderBotService', {
      cluster: cluster,
      taskDefinition: orderBotTaskDefinition,
      desiredCount: 1,
    });


    //-------------------------------------------------------------------------
    // Adding CDK Stack outputs
    //-------------------------------------------------------------------------
    new CfnOutput(this, 'cognitoUserPoolId', {
      value: userPool.userPoolId,
      description: 'The Congnito User Pool Id.',
      exportName: 'cognitoUserPoolId',
    });
    new CfnOutput(this, 'cognitoIdentityPoolId', {
      value: identityPool.identityPoolId,
      description: 'The Congnito Identity Pool Id.',
      exportName: 'cognitoIdentityPoolId',
    });
    new CfnOutput(this, 'cognitoClientId', {
      value: cognitoAppClientId.userPoolClientId,
      description: 'The Congnito Identity Pool App Client Id.',
      exportName: 'cognitoClientId',
    });
    new CfnOutput(this, 'auroraClusterEndpoint', {
      value: auroraCluster.clusterEndpoint.hostname,
      description: 'The Aurora cluster endpoint.',
      exportName: 'auroraClusterEndpoint',
    });
    new CfnOutput(this, 'auroraClusterPort', {
      value: `${auroraCluster.clusterEndpoint.port}`,
      description: 'The Aurora cluster port.',
      exportName: 'auroraClusterPort',
    });
    new CfnOutput(this, 'auroraSecret', {
      value: `${auroraCluster.secret?.secretName}`,
      description: 'Secret Managers secret holding Aurora credentials.',
      exportName: 'auroraSecret',
    });
    new CfnOutput(this, 'apiEndpoint', {
      value: httpApi.apiEndpoint,
      description: 'The HTTP API public endpoint.',
      exportName: 'apiEndpoint',
    });
    new CfnOutput(this, 'cognitoAdminUserPoolGroup', {
      value: `${adminUserPoolGroup.groupName}`,
      description: 'Cognito user pool admin group name.',
      exportName: 'cognitoAdminUserPoolGroup',
    });
    new CfnOutput(this, 'cognitoReadOnlyUserPoolGroup', {
      value: `${readUserPoolGroup.groupName}`,
      description: 'Cognito user pool read-only group name.',
      exportName: 'cognitoReadOnlyUserPoolGroup',
    });
    new CfnOutput(this, 'cognitoAdminUserSecretName', {
      value: adminUsersecret.secretName,
      description: 'Admin user secret manager secret name.',
      exportName: 'cognitoAdminUserSecretName',
    });
    new CfnOutput(this, 'cognitoReadOnlyUserSecretName', {
      value: readOnlyUsersecret.secretName,
      description: 'Read-only user secret manager secret name.',
      exportName: 'cognitoReadOnlyUserSecretName',
    });
    

    
  }
}