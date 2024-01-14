import { Stack, Tag } from 'aws-cdk-lib';

import type { Construct } from 'constructs';
import type { StackProps } from 'aws-cdk-lib';
import {
   ApplicationListener,
   ApplicationProtocol,
   ApplicationTargetGroup,
   type IApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import type { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';

import { Port, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Cluster, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';

import config from '@appify/shared/config';
import { Vpc } from '@appify/construct/vpc';
import { Loadbalancer } from '@appify/construct/loadBalancer';
import { SecurityGroup } from '@appify/construct/securityGroup';

import { TaskRole } from '@appify/construct/ecs-role';
import { Container } from '@appify/construct/container';
import { HealthCheck } from '@appify/construct/healthCheck';

enum Containers {
   Server = 'server',
   Client = 'client',
}

export class EcsServiceStack extends Stack {
   public readonly vpc: IVpc;
   public readonly albSG: ISecurityGroup;
   public readonly loadBalancer: IApplicationLoadBalancer;
   public readonly certificate: ICertificate;

   public readonly cluster: Cluster;
   public readonly serviceSG: ISecurityGroup;
   public readonly fargateService: FargateService;
   public readonly taskDefinition: FargateTaskDefinition;
   public readonly appTargetGroup: ApplicationTargetGroup;
   public readonly secureListener: ApplicationListener;

   constructor(scope: Construct, id: string, props: StackProps) {
      super(scope, id, props);

      // Lookup existing resources
      this.vpc = Vpc.vpcLookup(this, 'VpcLookup');
      this.albSG = SecurityGroup.securityGroupLookup(this, 'SecurityGroupLookup');
      this.loadBalancer = Loadbalancer.loadbalancerLookup(this, 'AlbLookup', this.albSG.securityGroupId);
      this.certificate = Certificate.fromCertificateArn(this, 'CertLookup', config.inf.certificateArn);

      // Create new resources
      this.cluster = new Cluster(this, 'EcsCluster', {
         vpc: this.vpc,
         containerInsights: true,
      });

      this.taskDefinition = new FargateTaskDefinition(this, 'EcsTaskDefinition', {
         taskRole: new TaskRole(this, 'EcsTaskRole'),
         executionRole: new TaskRole(this, 'ExecutionRole'),
         memoryLimitMiB: 4096,
         cpu: 2048,
      });

      new Container(this.taskDefinition, Containers.Server, {
         portMappings: [{ containerPort: 8080 }],
         memoryLimitMiB: 1024,
         cpu: 1024,
         log: true,
         tag: 'latest',
         environment: {
            DOPPLER_TOKEN: config.tokens.dopperToken,
         },
      });
      new Container(this.taskDefinition, Containers.Client, {
         portMappings: [{ containerPort: 3000 }],
         memoryLimitMiB: 2048,
         cpu: 1024,
         tag: 'latest',
         log: true,
      });

      this.serviceSG = new SecurityGroup(this, 'Service-SecurityGroup', {
         description: 'Ecs Fargate Service Security Group',
         securityGroupName: 'Service-SecurityGroup',
         allowAllOutbound: true,
         vpc: this.vpc,
      });

      this.fargateService = new FargateService(this, 'FargateSrvice', {
         vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
         securityGroups: [this.serviceSG],
         taskDefinition: this.taskDefinition,
         cluster: this.cluster,
         enableExecuteCommand: true,
         assignPublicIp: false,
         desiredCount: 1,
      });

      const clientTargetGroup = this.fargateService.loadBalancerTarget({
         containerName: Containers.Client,
         containerPort: 3000,
      });

      this.appTargetGroup = new ApplicationTargetGroup(this, 'ClientTargetGroup', {
         targets: [clientTargetGroup],
         protocol: ApplicationProtocol.HTTP,
         healthCheck: new HealthCheck({ path: '/' }),
         vpc: this.vpc,
         port: 3000,
      });

      this.secureListener = this.loadBalancer.addListener('SecureListener', {
         certificates: [this.certificate],
         open: true,
         port: 443,
      });

      this.secureListener.addTargetGroups('TargetListenerGroup', {
         targetGroups: [this.appTargetGroup],
      });

      this.fargateService.connections.allowFrom(this.loadBalancer, Port.tcp(443));
      new Tag('environment', config.inf.stage).visit(this);
   }
}
