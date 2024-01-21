import type { App, StackProps } from 'aws-cdk-lib';
import type { IHostedZone } from 'aws-cdk-lib/aws-route53';

import { Stack } from 'aws-cdk-lib';
import { IpAddresses, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';

import config from '@appify/shared/config';
import { VipConstruct } from '@appify/construct/vpc';
import { AlbConstruct } from '@appify/construct/alb';
import { TagStack } from '@appify/construct/tagStack';
import { SecurityGroupConstruct } from '@appify/construct/securityGroup';
import { ResourceStackPermssionBoundary } from '../pattern/resource.boundary';

export class ResourceStack extends Stack {
   public readonly vpc: VipConstruct;
   public readonly alb: AlbConstruct;
   public readonly albSG: SecurityGroup;
   public readonly zone: IHostedZone;

   constructor(scope: App, id: string, props?: StackProps) {
      super(scope, id, props);

      this.vpc = new VipConstruct(this, 'default-vpc', {
         ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
         exportParameter: true,
         natGateways: 1,
         maxAzs: 3,
      });

      this.alb = new AlbConstruct(this, 'default-alb', {
         vpcSubnets: { subnets: this.vpc.publicSubnets },
         exportParameter: true,
         internetFacing: true,
         vpc: this.vpc,
      });

      this.albSG = new SecurityGroupConstruct(this, 'alb-securityGroup', {
         description: 'Security Group for Load Balancer',
         exportParameter: true,
         allowAllOutbound: true,
         vpc: this.vpc,
      });

      this.zone = PublicHostedZone.fromHostedZoneAttributes(this, 'hosted-zone', {
         hostedZoneId: config.inf.hostedZoneId,
         zoneName: config.inf.hostedZoneDomain,
      });

      new ARecord(this, 'alb-record', {
         target: RecordTarget.fromAlias(new LoadBalancerTarget(this.alb)),
         recordName: config.inf.hostedZoneDomain,
         zone: this.zone,
      });

      this.alb.addSecurityGroup(this.albSG);

      new ResourceStackPermssionBoundary(this, 'resource-permission-boundary', {
         securityGroup: this.albSG,
         loadBalancer: this.alb,
         vpc: this.vpc,
      });

      new TagStack(this, [
         { identity: config.inf.identifierTag },
         { environment: config.inf.stage },
      ]);
   }
}
