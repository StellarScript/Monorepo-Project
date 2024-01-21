import type { Construct } from 'constructs';
import type { FargateTaskDefinitionProps } from 'aws-cdk-lib/aws-ecs';

import { FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { TaskDefinitionDescriptor } from './service.decorator';

@TaskDefinitionDescriptor()
export class TaskDefinitionConstruct extends FargateTaskDefinition {
   public static defaultFamilyName = 'appify';

   constructor(scope: Construct, id: string, props: Partial<FargateTaskDefinitionProps>) {
      super(scope, id, {
         family: TaskDefinitionConstruct.defaultFamilyName,

         taskRole: new Role(scope, 'TaskRole', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
         }),
         executionRole: new Role(scope, 'TaskExecutionRole', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
         }),

         ...props,
      });

      this.taskRole.addToPrincipalPolicy(
         new PolicyStatement({
            actions: ['logs:*', 'cloudwatch:*'],
            resources: [this.taskDefinitionArn],
         })
      );

      this.executionRole.addToPrincipalPolicy(
         new PolicyStatement({
            actions: ['logs:*', 'cloudwatch:*'],
            resources: [this.taskDefinitionArn],
         })
      );
   }
}
