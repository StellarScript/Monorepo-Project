import { Stack, App, StackProps } from 'aws-cdk-lib';

export class AppStack extends Stack {
   constructor(scope: App, id: string, props?: StackProps) {
      super(scope, id, props);

      // defines your stack here
   }
}
