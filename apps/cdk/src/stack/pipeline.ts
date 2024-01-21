import { Stack, StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export class EcsDeploymentPipeline extends Stack {
   constructor(scope: Construct, id: string, props: StackProps) {
      super(scope, id, props);
   }
}
