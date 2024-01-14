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
   public static readonly exportParamterName = '/sg/securityGroupId';

   constructor(scope: Construct, id: string, props: SecurityGroupProps) {
      super(scope, id, {
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

   public static getArn(sg: SecurityGroup): string {
      return `arn:aws:ec2:${sg.stack.region}:${sg.stack.account}:security-group/${sg.securityGroupId}`;
   }
}
