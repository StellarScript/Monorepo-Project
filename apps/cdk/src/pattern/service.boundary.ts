import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { AwsLogDriver, Cluster } from 'aws-cdk-lib/aws-ecs';

import config from '@appify/shared/config';
import { Arn } from '@appify/construct/arns';
import { SecurityGroupConstruct as SG } from '@appify/construct/securityGroup';

export class BoundaryProps {
   cluster: Cluster;
   securityGroup: SG;
   logDrivers: AwsLogDriver[];
}

export class ServiceStackPermssionBoundary extends Construct {
   constructor(scope: Construct, id: string, props: BoundaryProps) {
      super(scope, id);

      const account = Stack.of(this).account;
      const region = Stack.of(this).region;

      /**
       *
       * Creation Service Stack Permissions Boundary
       */
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
               resources: [Arn.EcsCluster(region, account, '*')],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:CreatePolicy'],
               resources: [Arn.Policy(account, '*')],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:CreateRole'],
               resources: [Arn.Role(account, '*')],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['logs:CreateLogGroup', 'logs:TagResource'],
               resources: [Arn.LogGroup(region, account, '*')],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:CreateTargetGroup'],
               resources: [Arn.ElbTargetGroup(region, account, '*', '*')],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:CreateSecurityGroup'],
               resources: [Arn.Vpc(region, account, '*')],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:CreateService'],
               resources: [Arn.EcsService(region, account, '*', '*')],
               conditions: this.requestTag,
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:CreateSecurityGroup', 'ec2:AuthorizeSecurityGroupEgress'],
               resources: [SG.securityGroupArn(props.securityGroup)],
               conditions: this.requestTag,
            }),
         ],
      });

      /**
       *
       * Deletion Service Stack Permissions Boundary
       */
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
               resources: [SG.securityGroupArn(props.securityGroup)],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DeleteCluster'],
               resources: [Arn.EcsCluster(region, account, props.cluster.clusterName)],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DeleteService'],
               resources: [Arn.EcsService(region, account, '*', '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:DeleteParameter'],
               resources: [Arn.SsmParameter(region, account, '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:DeleteTargetGroup'],
               resources: [Arn.ElbTargetGroup(region, account, '*', '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:DeleteRole'],
               resources: [Arn.Role(account, '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:DeleteRolePolicy', 'iam:DeletePolicy'],
               resources: [Arn.Policy(account, '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),
         ],
      });

      /**
       *
       * Modification Service Stack Permissions Boundary
       */
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
               resources: [Arn.EcsCluster(region, account, props.cluster.clusterName)],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ec2:DescribeSecurityGroups', 'ec2:AuthorizeSecurityGroupIngress'],
               resources: [SG.securityGroupArn(props.securityGroup)],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['logs:DescribeLogGroups', 'logs:ListTagsForResource'],
               resources: props.logDrivers.map((container) =>
                  Arn.LogGroup(region, account, container.logGroup.logGroupName)
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
               resources: [Arn.Policy(account, `${id}-Policy`)],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:GetRole', 'iam:PassRole', 'iam:GetRolePolicy', 'iam:PutRolePolicy'],
               resources: [Arn.Role(account, '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['iam:ListPolicyVersions', 'iam:DetachRolePolicy'],
               resources: [Arn.Role(account, '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ssm:PutParameter', 'ssm:GetParameters', 'ssm:AddTagsToResource'],
               resources: [Arn.SsmParameter(region, account, '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DescribeServices'],
               resources: [Arn.EcsService(region, account, '*', '*')],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['elasticloadbalancing:ModifyTargetGroupAttributes'],
               resources: [Arn.ElbTargetGroup(region, account, '*', '*')],
               conditions: { ...this.constructTag, ...this.requestTag },
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
