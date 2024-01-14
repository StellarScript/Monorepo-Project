import { Construct } from 'constructs';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib/core';

interface PermissionBoundaryProps {}

export class ServiceStackPermssionBoundary extends Construct {
   constructor(scope: Construct, id: string, props: PermissionBoundaryProps) {
      super(scope, id);

      const account = Stack.of(this).account;
      const region = Stack.of(this).region;

      new ManagedPolicy(this, `Creation-${id}-Policy`, {
         managedPolicyName: `Creation-${id}-Policy`,
         statements: [],
      });

      new ManagedPolicy(this, `Deletion-${id}-Policy`, {
         managedPolicyName: `Deletion-${id}-Policy`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DeleteCluster'],
               resources: [`arn:aws:ecs:${region}:${account}:cluster/*`],
            }),
         ],
      });

      new ManagedPolicy(this, `Boundary-${id}-Policy`, {
         managedPolicyName: `Boundary-${id}-Policy`,
         statements: [
            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DeregisterTaskDefinition', 'ecs:RegisterTaskDefinition'],
               resources: ['*'],
            }),

            new PolicyStatement({
               effect: Effect.ALLOW,
               actions: ['ecs:DescribeClusters', 'ecs:PutClusterCapacityProviders'],
               resources: [`arn:aws:ecs:${region}:${account}:cluster/*`],
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
