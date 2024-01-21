import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

import config from '@appify/shared/config';
import { Arn } from '@appify/construct/arns';
import { AlbConstruct as Alb } from '@appify/construct/alb';
import { VpcConstruct as Vpc } from '@appify/construct/vpc';
import { SecurityGroupConstruct as SG } from '@appify/construct/securityGroup';

export class BoundaryProps {
   vpc: Vpc;
   loadBalancer: Alb;
   securityGroup: SG;
}

export class ResourceStackPermssionBoundary extends Construct {
   constructor(scope: Construct, id: string, props: BoundaryProps) {
      super(scope, id);

      const account = Stack.of(this).account;
      const region = Stack.of(this).region;

      /**
       *
       * Creation Permission Boundary
       */
      new ManagedPolicy(this, `Creation-${id}`, {
         managedPolicyName: `Creation-${id}`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:CreateVpc',
                  'ec2:CreateTags',
                  'ec2:CreateSubnet',
                  'ec2:AllocateAddress',
                  'ec2:CreateRouteTable',
                  'ec2:AssociateRouteTable',
                  'ec2:CreateSecurityGroup',
                  'ec2:CreateInternetGateway',
                  'elasticloadbalancing:CreateLoadBalancer',
               ],
               resources: ['*'],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:CreateNatGateway'],
               resources: [`arn:aws:ec2:${region}:${account}:natgateway/*`],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:CreatePolicy'],
               resources: [`arn:aws:iam::${account}:policy/*`],
               conditions: this.requestTag,
            }),
         ],
      });

      /**
       *
       * Deletion Permission Boundary
       */
      new ManagedPolicy(this, `Deletion-${id}`, {
         managedPolicyName: `Deletion-${id}`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:DeleteLoadBalancer'],
               resources: [Alb.LoadbalancerArn(props.loadBalancer)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DeleteRoute', 'ec2:DeleteRouteTable'],
               resources: Vpc.routeTabeArns(props.vpc),
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DeleteVpc'],
               resources: [Vpc.vpcArn(props.vpc)],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DeleteSubnet', 'ec2:DeleteNatGateway'],
               resources: Vpc.subnetArns(props.vpc),
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DeleteInternetGateway'],
               resources: [Vpc.internetGatewayArn(props.vpc)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DeleteSecurityGroup'],
               resources: [SG.securityGroupArn(props.securityGroup)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:DeleteParameter'],
               resources: [`arn:aws:ssm:${region}:${account}:parameter/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:DeletePolicy', 'iam:DeletePolicyVersion'],
               resources: [`arn:aws:iam::${account}:policy/${id}-Policy`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),
         ],
      });

      /**
       *
       * Modification Permission Boundary
       */
      new ManagedPolicy(this, `Modification-${id}`, {
         managedPolicyName: `Modification-${id}`,
         statements: [
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
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'elasticloadbalancing:AddTags',
                  'elasticloadbalancing:ModifyLoadBalancerAttributes',
               ],
               resources: [Alb.LoadbalancerArn(props.loadBalancer)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:CreateRoute', 'ec2:DescribeRouteTables'],
               resources: Vpc.routeTabeArns(props.vpc),
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:CreateRouteTable',
                  'ec2:CreateSecurityGroup',
                  'ec2:ModifyVpcAttribute',
                  'ec2:AttachInternetGateway',
                  'ec2:DetachInternetGateway',
               ],
               resources: [Vpc.vpcArn(props.vpc)],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:ModifySubnetAttribute'],
               resources: Vpc.subnetArns(props.vpc),
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:AttachInternetGateway', 'ec2:DetachInternetGateway'],
               resources: [Vpc.internetGatewayArn(props.vpc)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ec2:RevokeSecurityGroupEgress',
                  'ec2:AuthorizeSecurityGroupEgress',
                  'ec2:AuthorizeSecurityGroupIngress',
               ],
               resources: [SG.securityGroupArn(props.securityGroup)],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:ReleaseAddress', 'ec2:AllocateAddress', 'ec2:DescribeAddresses'],
               resources: [Arn.ElasticIp(region, account, '*')],
               conditions: this.constructTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:GetParameters'],
               resources: [Arn.SsmParameter(region, account, '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:PutParameter', 'ssm:AddTagsToResource'],
               resources: [Arn.SsmParameter(region, account, '*')],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'iam:GetPolicy',
                  'iam:ListRolePolicies',
                  'iam:ListPolicyVersions',
                  'iam:CreatePolicyVersion',
                  'iam:ListEntitiesForPolicy',
               ],
               resources: [`arn:aws:iam::${account}:policy/${id}-Policy`],
               conditions: { ...this.constructTag, ...this.requestTag },
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
            'aws:TagKeys': ['identity', 'environment'],
         },
      };
   }

   private get requestTag() {
      return {
         StringEquals: {
            'aws:RequestTag/environment': [config.inf.stage],
         },
      };
   }
}
