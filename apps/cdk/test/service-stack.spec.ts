import 'reflect-metadata';

import { it, describe, beforeAll } from 'vitest';
import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { EcsServiceStack } from '../src/stack/service';

describe('Service Stack', () => {
   let stack: EcsServiceStack;

   beforeAll(() => {
      const app = new App();
      stack = new EcsServiceStack(app, 'service-stack', {
         env: { account: '1234', region: 'us-east-2' },
      });
   });

   it('service cluster', () => {
      const template = Template.fromStack(stack);
      //   template.hasResourceProperties('AWS::EC2::VPC', {
      //      CidrBlock: '10.0.0.0/16',
      //      EnableDnsHostnames: true,
      //      EnableDnsSupport: true,
      //   });

      console.log('------', template);
   });
});
