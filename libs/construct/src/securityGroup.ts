import type { Construct } from 'constructs';
import { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import type { Vpc } from './vpc';

import {
   SecurityGroup as SecurityGroupConstruct,
   SecurityGroupProps as SecurityGroupConstructProps,
} from 'aws-cdk-lib/aws-ec2';

export interface SecurityGroupProps extends Partial<SecurityGroupConstructProps> {
   vpc: Vpc | IVpc;
   exportName?: string;
}

export class SecurityGroup extends SecurityGroupConstruct {
   public static readonly securityGroupName = 'resource-security-group';

   constructor(scope: Construct, id: string, props: SecurityGroupProps) {
      super(scope, id, {
         securityGroupName: SecurityGroup.securityGroupName,
         ...props,
      });
   }

   public static securityGroupLookup(
      scope: Construct,
      id: string,
      vpc: IVpc,
      securityGroupName?: string
   ): ISecurityGroup {
      const name = securityGroupName || SecurityGroup.securityGroupName;
      return SecurityGroup.fromLookupByName(scope, id, name, vpc);
   }
}
