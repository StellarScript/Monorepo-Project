import { Stack, StackProps } from 'aws-cdk-lib';
import { Port } from 'aws-cdk-lib/aws-ec2';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Cluster, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ApplicationProtocol, ApplicationTargetGroup } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import type { Construct } from 'constructs';
import type { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import type { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import type { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import config from '@appify/shared/config';
import { VpcConstruct } from '@appify/construct/vpc';
import { AlbConstruct } from '@appify/construct/alb';
import { Container } from '@appify/construct/container';
import { TagStack } from '@appify/construct/tagStack';
import { HealthCheck } from '@appify/construct/healthCheck';
import { SecurityGroupConstruct } from '@appify/construct/securityGroup';
import { FargateServiceConstruct } from '@appify/construct/fargateService';
import { TaskDefinitionConstruct } from '@appify/construct/taskDefinition';

import { Containers, ImageTag } from '../pattern/constants';
import { EcsDeploymentPipeline } from '../pattern/deployment.pipeline';
import { ServiceStackPermssionBoundary } from '../pattern/service.boundary';

export class EcsServiceStack extends Stack {
   public readonly vpc: IVpc;
   public readonly albSG: ISecurityGroup;
   public readonly alb: IApplicationLoadBalancer;
   public readonly certificate: ICertificate;

   public readonly cluster: Cluster;
   public readonly serviceSG: SecurityGroup;
   public readonly fargateService: FargateService;
   public readonly taskDefinition: FargateTaskDefinition;

   public readonly blueTargetGroup: ApplicationTargetGroup;
   public readonly greenTargetGroup: ApplicationTargetGroup;
   public readonly testListener: ApplicationListener;
   public readonly secureListener: ApplicationListener;

   public readonly deploymentPipeline: EcsDeploymentPipeline;
   public readonly serviceBoundary: ServiceStackPermssionBoundary;

   constructor(scope: Construct, id: string, props: StackProps) {
      super(scope, id, props);

      /**
       * Existing Resources
       */
      this.vpc = VpcConstruct.vpcLookup(this, 'vpc-lookup');
      this.alb = AlbConstruct.albLookup(this, 'alb-lookup');
      this.albSG = SecurityGroupConstruct.securityGroupLookup(this, 'securitygroup-lookup');
      this.certificate = Certificate.fromCertificateArn(this, 'cert-lookup', config.inf.certificateArn);

      /**
       *
       * Ecs Resources
       */
      this.cluster = new Cluster(this, 'ecs-cluster', {
         containerInsights: true,
         vpc: this.vpc,
      });

      this.taskDefinition = new TaskDefinitionConstruct(this, 'fargate-taskDefinition', {
         family: TaskDefinitionConstruct.defaultFamilyName,
         memoryLimitMiB: 512,
         cpu: 256,
      });

      const serverContainer = new Container(this.taskDefinition, Containers.Server, {
         portMappings: [{ containerPort: 8080 }],
         tag: ImageTag.Latest,
         log: true,
         environment: {
            DOPPLER_TOKEN: config.tokens.doppler,
         },
      });
      const clientContainer = new Container(this.taskDefinition, Containers.Client, {
         portMappings: [{ containerPort: 3000 }],
         tag: ImageTag.Latest,
         essential: true,
         log: true,
      });

      this.serviceSG = new SecurityGroupConstruct(this, 'service-securityGroup', {
         description: 'Ecs Fargate Service Security Group',
         allowAllOutbound: true,
         vpc: this.vpc,
      });

      this.fargateService = new FargateServiceConstruct(this, 'fargate-service', {
         securityGroups: [this.serviceSG],
         taskDefinition: this.taskDefinition,
         cluster: this.cluster,
         desiredCount: 1,
      });

      const clientTargetGroup = this.fargateService.loadBalancerTarget({
         containerName: Containers.Client,
         containerPort: 3000,
      });

      this.blueTargetGroup = new ApplicationTargetGroup(this, 'blue-targetGroup', {
         targets: [clientTargetGroup],
         protocol: ApplicationProtocol.HTTP,
         healthCheck: new HealthCheck({ path: '/' }),
         vpc: this.vpc,
         port: 3000,
      });

      this.greenTargetGroup = new ApplicationTargetGroup(this, 'green-targetGroup', {
         targets: [clientTargetGroup],
         protocol: ApplicationProtocol.HTTP,
         healthCheck: new HealthCheck({ path: '/' }),
         vpc: this.vpc,
         port: 3000,
      });

      this.testListener = this.alb.addListener('test-listenerGroup', {
         port: 3000,
         protocol: ApplicationProtocol.HTTP,
      });
      this.testListener.addTargetGroups('test-listenerGroup', {
         targetGroups: [this.greenTargetGroup],
      });

      this.secureListener = this.alb.addListener('secure-listener', {
         certificates: [this.certificate],
         open: true,
         port: 443,
      });
      this.secureListener.addTargetGroups('target-listenerGroup', {
         targetGroups: [this.blueTargetGroup],
      });

      this.fargateService.connections.allowFrom(this.alb, Port.tcp(443));

      this.deploymentPipeline = new EcsDeploymentPipeline(this, 'deployment-pipeline', {
         listener: this.secureListener,
         fargateService: this.fargateService,
         blueTargetGroup: this.blueTargetGroup,
         greenTargetGroup: this.greenTargetGroup,
      });

      this.serviceBoundary = new ServiceStackPermssionBoundary(this, 'service-permissionBoundary', {
         cluster: this.cluster,
         securityGroup: this.serviceSG,
         logDrivers: [serverContainer.logging, clientContainer.logging],
      });

      new TagStack(this, [{ identity: config.inf.identifierTag }, { environment: config.inf.stage }]);
   }
}
