import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AppStack } from '../src/stack/app';

test('SQS Queue Created', () => {
   const app = new App();

   const stack = new AppStack(app, 'MyTestStack');
   const template = Template.fromStack(stack);

   expect(template).toBeDefined();
});
