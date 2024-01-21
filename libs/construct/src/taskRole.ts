import type { Construct } from 'constructs';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class TaskRole extends Role {
   constructor(scope: Construct, id: string, roleName?: string) {
      super(scope, id, {
         roleName: roleName,
         assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      });

      this.addManagedPolicy(
         ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      );

      this.addToPolicy(
         new PolicyStatement({
            actions: ['logs:*', 'cloudwatch:*'],
            resources: ['*'],
         })
      );
   }
}
