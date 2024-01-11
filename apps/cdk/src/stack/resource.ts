import { Stack, Tag, CfnOutput } from 'aws-cdk-lib';
import type { App, StackProps } from 'aws-cdk-lib';
import type { IHostedZone } from 'aws-cdk-lib/aws-route53';

import { IpAddresses } from 'aws-cdk-lib/aws-ec2';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';

import config from '@appify/shared/config';
import { Vpc } from '@appify/construct/vpc';
import { SecurityGroup } from '@appify/construct/securityGroup';

export class ResourceStack extends Stack {
   public readonly vpc: Vpc;
   public readonly zone: IHostedZone;

   public readonly loadBalancer: ApplicationLoadBalancer;
   public readonly albSecurityGroup: SecurityGroup;

   constructor(scope: App, id: string, props?: StackProps) {
      super(scope, id, props);

      this.vpc = new Vpc(this, 'DefaultVpc', {
         maxAzs: 3,
         natGateways: 1,
         ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      });

      this.loadBalancer = new ApplicationLoadBalancer(this, 'DefaultAlb', {
         vpc: this.vpc,
         internetFacing: true,
         vpcSubnets: { subnets: this.vpc.publicSubnets },
      });

      this.albSecurityGroup = new SecurityGroup(this, 'AlbSecurityGroup', {
         vpc: this.vpc,
         allowAllOutbound: true,
         description: 'Load Balancer Security Group',
      });

      this.loadBalancer.addSecurityGroup(this.albSecurityGroup);

      this.zone = PublicHostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
         hostedZoneId: config.inf.hostedZoneId,
         zoneName: config.inf.hostedZoneDomain,
      });

      new ARecord(this, 'AlbARecord', {
         target: RecordTarget.fromAlias(new LoadBalancerTarget(this.loadBalancer)),
         recordName: config.inf.hostedZoneDomain,
         zone: this.zone,
      });

      new CfnOutput(this, 'AlbArn', {
         exportName: 'albArn',
         value: this.loadBalancer.loadBalancerArn,
      });

      new Tag('environment', config.inf.stage).visit(this);
   }
}
