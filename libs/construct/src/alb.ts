import type { Construct } from 'constructs';
import type { ApplicationLoadBalancerProps } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import type { VipConstruct } from './vip';

import { Parameter } from './parameter';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export interface AlbConstructProps extends Partial<ApplicationLoadBalancerProps> {
   vpc: VipConstruct;
   exportName?: string;
   exportParameter?: boolean;
}

export class AlbConstruct extends ApplicationLoadBalancer {
   public static readonly albArnExport = '/alb/securityGroup';

   constructor(scope: Construct, id: string, props: AlbConstructProps) {
      super(scope, id, props);

      if (props.exportParameter) {
         new StringParameter(scope, `${id}-parameter`, {
            stringValue: this.loadBalancerArn,
            parameterName: props.exportName || AlbConstruct.albArnExport,
         });
      }
   }

   public static albLookup(scope: Construct, id: string, loadBalancerArn?: string) {
      const paramterValue = Parameter.stringValue(scope, AlbConstruct.albArnExport);
      return ApplicationLoadBalancer.fromLookup(scope, id, {
         loadBalancerArn: loadBalancerArn || paramterValue,
      });
   }
}
