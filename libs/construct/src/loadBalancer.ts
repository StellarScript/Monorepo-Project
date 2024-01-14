import type { Construct } from 'constructs';
import type { ApplicationLoadBalancerProps } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { CfnOutput, Stack } from 'aws-cdk-lib/core';
import {
   ApplicationLoadBalancer as Alb,
   IApplicationLoadBalancer as IAlb,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import type { Vpc } from './vpc';
import { Parameter } from './paramter';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

interface LoadbalancerProps extends Partial<ApplicationLoadBalancerProps> {
   vpc: Vpc;
   exportName?: string;
}

export class Loadbalancer extends Alb {
   public static readonly exportParamterName = '/alb/securityGroup';

   constructor(scope: Construct, id: string, props: LoadbalancerProps) {
      super(scope, id, {
         ...props,
      });

      new StringParameter(scope, `${id}-Parameter`, {
         stringValue: this.loadBalancerArn,
         parameterName: Loadbalancer.exportParamterName,
      });
   }

   public static loadbalancerLookup(scope: Construct, id: string, loadBalancerArn?: string): IAlb {
      const paramterValue = Parameter.stringValue(scope, Loadbalancer.exportParamterName);
      return Alb.fromLookup(scope, id, {
         loadBalancerArn: paramterValue,
      });
   }

   public static getArn(alb: Loadbalancer): string {
      return `arn:aws:elasticloadbalancing:${alb.stack.region}:${alb.stack.account}:loadbalancer/${alb.loadBalancerName}`;
   }
}
