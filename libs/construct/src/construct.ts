import { App } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ReusableConstruct extends Construct {
   constructor(scope: App, id: string) {
      super(scope, id);

      // defines your construct here
   }
}
