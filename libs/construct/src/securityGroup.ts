import type { Construct } from 'constructs';
import type { IVpc, SecurityGroupProps, Vpc } from 'aws-cdk-lib/aws-ec2';

import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Arn } from './arns';

export interface SecurityGroupConstructProps extends Partial<SecurityGroupProps> {
   vpc: Vpc | IVpc;
   exportName?: string;
   exportParameter?: boolean;
}

export class SecurityGroupConstruct extends SecurityGroup {
   public static defaultExportName = '/vip/id';

   constructor(scope: Construct, id: string, props: SecurityGroupConstructProps) {
      super(scope, id, props);

      if (props.exportParameter || props.exportName) {
         new StringParameter(this, `${id}Id-Parameter`, {
            parameterName: props.exportName || SecurityGroupConstruct.defaultExportName,
            stringValue: this.securityGroupId,
         });
      }
   }

   public static securityGroupLookup(scope: Construct, id: string, parameterName?: string) {
      const paramterValue = StringParameter.valueFromLookup(
         scope,
         parameterName || SecurityGroupConstruct.defaultExportName
      );
      return SecurityGroup.fromSecurityGroupId(scope, id, paramterValue);
   }

   public static securityGroupArn(sg: SecurityGroup): string {
      return Arn.SecurityGroup(sg.stack.region, sg.stack.account, sg.securityGroupId);
   }
}
