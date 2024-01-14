import type { Construct } from 'constructs';
import { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import type { Vpc } from './vpc';

import {
   SecurityGroup as SecurityGroupConstruct,
   SecurityGroupProps as SecurityGroupConstructProps,
} from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export interface SecurityGroupProps extends Partial<SecurityGroupConstructProps> {
   vpc: Vpc | IVpc;
   exportName?: string;
}

export class SecurityGroup extends SecurityGroupConstruct {
   public static readonly exportParamterName = 'DefaultSecurityGroup';

   constructor(scope: Construct, id: string, props: SecurityGroupProps) {
      super(scope, id, {
         securityGroupName: SecurityGroup.exportParamterName,
         ...props,
      });

      new StringParameter(this, `${id}Id-Parameter`, {
         parameterName: props.exportName || SecurityGroup.exportParamterName,
         stringValue: this.securityGroupId,
      });
   }

   public static securityGroupLookup(
      scope: Construct,
      id: string,
      securityGroupName?: string
   ): ISecurityGroup {
      const name = securityGroupName || SecurityGroup.exportParamterName;
      return SecurityGroup.fromSecurityGroupId(scope, id, name);
   }
}
