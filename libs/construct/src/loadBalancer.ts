import type { Construct } from 'constructs';
import type { ApplicationLoadBalancerProps } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
   ApplicationLoadBalancer as Alb,
   IApplicationLoadBalancer as IAlb,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { CfnOutput, Fn } from 'aws-cdk-lib/core';
import type { Vpc } from './vpc';

interface LoadbalancerProps extends Partial<ApplicationLoadBalancerProps> {
   vpc: Vpc;
   exportName?: string;
}

export class Loadbalancer extends Alb {
   public static readonly loadbalancerExportName = 'securityGroup';

   constructor(scope: Construct, id: string, props: LoadbalancerProps) {
      super(scope, id, {
         ...props,
      });

      new CfnOutput(this, 'AlbArn', {
         value: this.loadBalancerArn,
         exportName: props.exportName || Loadbalancer.loadbalancerExportName,
      });
   }

   public static loadbalancerLookup(
      scope: Construct,
      id: string,
      securityGroupId: string,
      loadBalancerArn?: string
   ): IAlb {
      return Alb.fromApplicationLoadBalancerAttributes(scope, id, {
         loadBalancerArn: loadBalancerArn || Fn.importValue(Loadbalancer.loadbalancerExportName),
         securityGroupId: securityGroupId,
      });
   }
}
