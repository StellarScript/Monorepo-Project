import type { Construct } from 'constructs';
import type { ApplicationLoadBalancerProps } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import type { VpcConstruct } from './vpc';

import { Parameter } from './parameter';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Arn } from '@appify/construct/arns';

export interface AlbConstructProps extends Partial<ApplicationLoadBalancerProps> {
   vpc: VpcConstruct;
   exportName?: string;
   exportParameter?: boolean;
}

export class AlbConstruct extends ApplicationLoadBalancer {
   public static readonly defaultExportName = '/alb/securityGroup';

   constructor(scope: Construct, id: string, props: AlbConstructProps) {
      super(scope, id, props);

      if (props.exportParameter || props.exportName) {
         new StringParameter(scope, `${id}-parameter`, {
            stringValue: this.loadBalancerArn,
            parameterName: props.exportName || AlbConstruct.defaultExportName,
         });
      }
   }

   public static albLookup(scope: Construct, id: string, parameterName?: string) {
      const paramterValue = Parameter.stringValue(
         scope,
         parameterName || AlbConstruct.defaultExportName
      );
      return ApplicationLoadBalancer.fromLookup(scope, id, {
         loadBalancerArn: paramterValue,
      });
   }

   public static LoadbalancerArn(alb: ApplicationLoadBalancer): string {
      return Arn.Alb(alb.stack.region, alb.stack.account, alb.loadBalancerName);
   }
}
