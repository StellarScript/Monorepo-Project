import type { Construct } from 'constructs';
import type { IIpAddresses, VpcProps } from 'aws-cdk-lib/aws-ec2';

import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Parameter } from './parameter';

export interface VipConstructProps extends Partial<VpcProps> {
   ipAddresses: IIpAddresses;
   exportParameter?: boolean;
   parameterName?: string;
}

export class VipConstruct extends Vpc {
   public static vipIdExport = '/vip/id';

   constructor(scope: Construct, id: string, props: VipConstructProps) {
      super(scope, id, {
         subnetConfiguration: [
            {
               cidrMask: 24,
               name: 'public',
               subnetType: SubnetType.PUBLIC,
            },
            {
               cidrMask: 24,
               name: 'private',
               subnetType: SubnetType.PRIVATE_WITH_EGRESS,
            },
            {
               cidrMask: 28,
               name: 'isolated',
               subnetType: SubnetType.PRIVATE_ISOLATED,
            },
         ],
         ...props,
      });

      if (props.exportParameter) {
         new StringParameter(this, `${props.parameterName}-vipParameter`, {
            parameterName: props.parameterName || VipConstruct.vipIdExport,
            stringValue: this.vpcId,
         });
      }
   }

   public static vpcLookup(scope: Construct, id: string, parameterName?: string) {
      return Vpc.fromLookup(scope, id, {
         vpcId: Parameter.stringValue(scope, parameterName || VipConstruct.vipIdExport),
      });
   }
}
