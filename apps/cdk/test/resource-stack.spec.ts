import { it, describe, beforeAll } from 'vitest';
import { Template } from 'aws-cdk-lib/assertions';
import { expect as expectCdk, haveResource } from '@aws-cdk/assert';

import { App } from 'aws-cdk-lib';
import { ResourceStack } from '../src/stack/resource';
import config from '../../../libs/shared/src/config';

describe('Resource Stack', () => {
   let stack: ResourceStack;

   beforeAll(() => {
      const app = new App();
      stack = new ResourceStack(app, 'resource-stack');
   });

   it('resource stack vpc', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::EC2::VPC', {
         CidrBlock: '10.0.0.0/16',
         EnableDnsHostnames: true,
         EnableDnsSupport: true,
      });
   });

   it('resource stack alb', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
         LoadBalancerAttributes: [{ Key: 'deletion_protection.enabled', Value: 'false' }],
         Scheme: 'internet-facing',
         Type: 'application',
      });
   });

   it('resource stack hosted zone record', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Route53::RecordSet', {
         HostedZoneId: config.inf.hostedZoneId,
         Name: `${config.inf.hostedZoneDomain}.`,
         Type: 'A',
      });
   });

   it('resource stack alb security group', () => {
      expectCdk(stack).to(
         haveResource('AWS::EC2::SecurityGroup', {
            SecurityGroupEgress: [
               {
                  CidrIp: '255.255.255.255/32',
                  Description: 'Disallow all traffic',
                  FromPort: 252,
                  IpProtocol: 'icmp',
                  ToPort: 86,
               },
            ],
         })
      );
   });
});
