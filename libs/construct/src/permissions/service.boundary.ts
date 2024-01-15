import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib/core';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { AwsLogDriver, Cluster } from 'aws-cdk-lib/aws-ecs';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
   ApplicationTargetGroup,
   IApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { SecurityGroup as SG } from '@appify/construct/securityGroup';

interface PermissionBoundaryProps {
   vpc: IVpc;
   cluster: Cluster;
   logDrivers: AwsLogDriver[];
   securityGroup: SecurityGroup;
   targetGroups: ApplicationTargetGroup[];
   loadBalancer: IApplicationLoadBalancer;
}

export class ServiceStackPermssionBoundary extends Construct {
   constructor(scope: Construct, id: string, props: PermissionBoundaryProps) {
      super(scope, id);

      const account = Stack.of(this).account;
      const region = Stack.of(this).region;

      new ManagedPolicy(this, `Creation-${id}`, {
         managedPolicyName: `Creation-${id}`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:CreateListener'],
               resources: ['*'],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:CreateCluster'],
               resources: [`arn:aws:ecs:${region}:${account}:cluster/*`],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:CreatePolicy'],
               resources: [`arn:aws:iam::${account}:policy/*`],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:CreateRole'],
               resources: [`arn:aws:iam::${account}:role/*`],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['logs:CreateLogGroup', 'logs:TagResource'],
               resources: [`arn:aws:logs:${region}:${account}:log-group:*`],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:CreateTargetGroup'],
               resources: [`arn:aws:elasticloadbalancing:${region}:${account}:targetgroup/*/*`],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:CreateSecurityGroup'],
               resources: [`arn:aws:ec2:${region}:${account}:vpc/*`],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:CreateSecurityGroup', 'ec2:AuthorizeSecurityGroupEgress'],
               resources: [SG.getArn(props.securityGroup)],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:CreateService'],
               resources: [`arn:aws:ecs:${region}:${account}:service/*/*`],
               conditions: this.requestTag,
            }),
         ],
      });

      new ManagedPolicy(this, `Deletion-${id}`, {
         managedPolicyName: `Deletion-${id}`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:DeleteListener'],
               resources: ['*'],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:RevokeSecurityGroupIngress', 'ec2:DeleteSecurityGroup'],
               resources: [SG.getArn(props.securityGroup)],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DeleteCluster'],
               resources: [`arn:aws:ecs:${region}:${account}:cluster/${props.cluster.clusterName}`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DeleteService'],
               resources: [`arn:aws:ecs:${region}:${account}:service/*/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:DeleteParameter'],
               resources: [`arn:aws:ssm:${region}:${account}:parameter/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:DeleteTargetGroup'],
               resources: [`arn:aws:elasticloadbalancing:${region}:${account}:targetgroup/*/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:DeleteRole'],
               resources: [`arn:aws:iam::${account}:role/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:DeleteRolePolicy', 'iam:DeletePolicy'],
               resources: [`arn:aws:iam::${account}:policy/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),
         ],
      });

      new ManagedPolicy(this, `Modification-${id}`, {
         managedPolicyName: `Modification-${id}`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'ecs:RegisterTaskDefinition',
                  'ecs:DeregisterTaskDefinition',
                  'elasticloadbalancing:AddTags',
               ],
               resources: ['*'],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DescribeClusters', 'ecs:PutClusterCapacityProviders'],
               resources: [`arn:aws:ecs:${region}:${account}:cluster/${props.cluster.clusterName}`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DescribeSecurityGroups', 'ec2:AuthorizeSecurityGroupIngress'],
               resources: [SG.getArn(props.securityGroup)],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['logs:DescribeLogGroups', 'logs:ListTagsForResource'],
               resources: props.logDrivers.map(
                  (container) =>
                     `arn:aws:logs:${region}:${account}:log-group:${container.logGroup.logGroupName}`
               ),
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'elasticloadbalancing:DescribeListeners',
                  'elasticloadbalancing:DescribeTargetGroups',
                  'elasticloadbalancing:DescribeLoadBalancers',
                  'elasticloadbalancing:DescribeLoadBalancerAttributes',
               ],
               resources: ['*'],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DescribeNetworkAcls'],
               resources: ['*'],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: [
                  'iam:GetPolicy',
                  'iam:GetRolePolicy',
                  'iam:PutRolePolicy',
                  'iam:ListRolePolicies',
                  'iam:DetachRolePolicy',
                  'iam:AttachRolePolicy',
                  'iam:ListAttachedRolePolicies',
               ],
               resources: [`arn:aws:iam::${account}:policy/${id}-Policy`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:GetRole', 'iam:PassRole', 'iam:GetRolePolicy', 'iam:PutRolePolicy'],
               resources: [`arn:aws:iam::${account}:role/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:ListPolicyVersions', 'iam:DetachRolePolicy'],
               resources: [`arn:aws:iam::${account}:policy/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:PutParameter', 'ssm:GetParameters', 'ssm:AddTagsToResource'],
               resources: [`arn:aws:ssm:${region}:${account}:parameter/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DescribeServices'],
               resources: [`arn:aws:ecs:${region}:${account}:service/*/*`],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:ModifyTargetGroupAttributes'],
               resources: [`arn:aws:elasticloadbalancing:${region}:${account}:targetgroup/*/*`],
               conditions: { ...this.constructTag, ...this.requestTag },
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

   private get requestTag() {
      return {
         StringEquals: {
            'aws:RequestTag/environment': ['environment'],
         },
      };
   }
}
