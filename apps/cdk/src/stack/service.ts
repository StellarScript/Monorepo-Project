import { Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

import type { Construct } from 'constructs';
import type { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import type { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import type { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { Cluster } from 'aws-cdk-lib/aws-ecs';

import config from '@appify/shared/config';
import { VpcConstruct } from '@appify/construct/vpc';
import { AlbConstruct } from '@appify/construct/alb';
import { SecurityGroupConstruct } from '@appify/construct/securityGroup';

export interface EcsServiceStackProps {}

export class EcsServiceStack extends Stack {
   public readonly vpc: IVpc;
   public readonly albSG: ISecurityGroup;
   public readonly alb: IApplicationLoadBalancer;
   public readonly certificate: ICertificate;

   public readonly cluster: Cluster;

   constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
      super(scope, id, props);

      /**
       * Existing Resources
       */
      this.vpc = VpcConstruct.vpcLookup(this, 'VpcLookup');
      this.albSG = SecurityGroupConstruct.securityGroupLookup(this, 'SecurityGroupLookup');
      this.alb = AlbConstruct.albLookup(this, 'AlbLookup', this.albSG.securityGroupId);
      this.certificate = Certificate.fromCertificateArn(this, 'CertLookup', config.inf.certificateArn);

      /**
       *
       * Ecs Resources
       */
      this.cluster = new Cluster(this, 'EcsCluster', {
         vpc: this.vpc,
         containerInsights: true,
      });
   }
}
