import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

import config from '@appify/shared/config';
import { Arn } from '@appify/construct/arns';
import { AlbConstruct as Alb } from '@appify/construct/alb';
import { VipConstruct as Vpc } from '@appify/construct/vpc';
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
