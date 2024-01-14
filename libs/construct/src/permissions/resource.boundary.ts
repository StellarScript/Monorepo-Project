import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib/core';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

import { Vpc } from '../vpc';
import { Loadbalancer } from '../loadBalancer';
import { SecurityGroup } from '../securityGroup';

interface PermissionBoundaryProps {
   vpc: Vpc;
   loadBalancer: Loadbalancer;
   securityGroup: SecurityGroup;
}

export class ResourcePermssionBoundaryPolicy extends Construct {
   constructor(scope: Construct, id: string, props: PermissionBoundaryProps) {
      super(scope, id);

      const account = Stack.of(this).account;
      const region = Stack.of(this).region;

      new ManagedPolicy(this, `${id}-Policy`, {
         managedPolicyName: `${id}-Policy`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:CreateTags',
                  'ec2:CreateVpc',
                  'ec2:CreateSubnet',
                  'ec2:AllocateAddress',
                  'ec2:AssociateRouteTable',
                  'ec2:CreateRouteTable',
                  'ec2:CreateNatGateway',
                  'ec2:CreateInternetGateway',
                  'ec2:CreateSecurityGroup',
                  'elasticloadbalancing:CreateLoadBalancer',
               ],
               resources: ['*'],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:DescribeVpcs',
                  'ec2:DescribeSubnets',
                  'ec2:DescribeAddresses',
                  'ec2:DescribeRouteTables',
                  'ec2:AssociateRouteTable',
                  'ec2:DescribeNatGateways',
                  'ec2:DisassociateRouteTable',
                  'ec2:DescribeSecurityGroups',
                  'ec2:DescribeInternetGateways',
                  'ec2:DescribeAccountAttributes',
                  'elasticloadbalancing:DescribeTags',
                  'elasticloadbalancing:DescribeLoadBalancers',
                  'elasticloadbalancing:DescribeLoadBalancerAttributes',
               ],
               resources: ['*'],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'elasticloadbalancing:AddTags',
                  'elasticloadbalancing:DeleteLoadBalancer',
                  'elasticloadbalancing:ModifyLoadBalancerAttributes',
               ],
               resources: [props.loadBalancer.loadBalancerArn],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:CreateRoute',
                  'ec2:DeleteRoute',
                  'ec2:DeleteRouteTable',
                  'ec2:DescribeRouteTables',
               ],
               resources: Vpc.getAllRouteTableArns(props.vpc),
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:DeleteVpc',
                  'ec2:CreateRouteTable',
                  'ec2:CreateSecurityGroup',
                  'ec2:ModifyVpcAttribute',
                  'ec2:AttachInternetGateway',
                  'ec2:DetachInternetGateway',
               ],
               resources: [props.vpc.vpcArn],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DeleteSubnet', 'ec2:DeleteNatGateway', 'ec2:ModifySubnetAttribute'],
               resources: Vpc.getAllSubnetArns(props.vpc),
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:AttachInternetGateway',
                  'ec2:DeleteInternetGateway',
                  'ec2:DetachInternetGateway',
               ],
               resources: [Vpc.getInternetGatewayArn(props.vpc)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:DeleteSecurityGroup',
                  'ec2:RevokeSecurityGroupEgress',
                  'ec2:AuthorizeSecurityGroupEgress',
                  'ec2:AuthorizeSecurityGroupIngress',
               ],
               resources: [SecurityGroup.getArn(props.securityGroup)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:ReleaseAddress', 'ec2:AllocateAddress', 'ec2:DescribeAddresses'],
               resources: [`arn:aws:ec2:${region}:${account}:elastic-ip/*`],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:CreateNatGateway', 'ec2:DeleteNatGateway'],
               resources: [`arn:aws:ec2:${region}:${account}:natgateway/*`],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:GetParameters', 'ssm:DeleteParameter'],
               resources: [`arn:aws:ssm:${region}:${account}:parameter/*`],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:PutParameter', 'ssm:AddTagsToResource'],
               resources: [`arn:aws:ssm:${region}:${account}:parameter/*`],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:CreatePolicy'],
               resources: [`arn:aws:iam::${account}:policy/*`],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'route53:GetHostedZone',
                  'route53:ListHostedZones',
                  'route53:ChangeResourceRecordSets',
               ],
               resources: [`arn:aws:route53:::hostedzone/*`],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'iam:GetPolicy',
                  'iam:DeletePolicy',
                  'iam:ListPolicyVersions',
                  'iam:ListEntitiesForPolicy',
               ],
               resources: [`arn:aws:iam::${account}:policy/*`],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['route53:GetChange'],
               resources: [`arn:aws:route53:::change/*`],
               conditions: this.constructTag,
            }),
         ],
      });
   }

   private get constructTag() {
      return {
         'ForAllValues:StringEquals': {
            'aws:TagKeys': ['environment'],
         },
      };
   }
}
