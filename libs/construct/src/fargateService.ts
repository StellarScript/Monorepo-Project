import type { Construct } from 'constructs';
import type { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type { Cluster, FargateServiceProps, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';

import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { FargateService, DeploymentControllerType, PropagatedTagSource } from 'aws-cdk-lib/aws-ecs';

export interface FargateServiceConstructProps extends Partial<FargateServiceProps> {
   cluster: Cluster;
   securityGroups: SecurityGroup[];
   taskDefinition: FargateTaskDefinition;
}

export class FargateServiceConstruct extends FargateService {
   constructor(scope: Construct, id: string, props: FargateServiceConstructProps) {
      super(scope, id, {
         assignPublicIp: false,
         enableExecuteCommand: true,
         propagateTags: PropagatedTagSource.TASK_DEFINITION,
         vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
         deploymentController: { type: DeploymentControllerType.CODE_DEPLOY },
         ...props,
      });
   }
}
