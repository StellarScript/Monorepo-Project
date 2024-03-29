#!/usr/bin/env node
import 'reflect-metadata';
import 'source-map-support/register';

import { App } from 'aws-cdk-lib';
import config from '@appify/shared/config';
import { StackDescriptor } from '@appify/construct/service.decorator';

import { ResourceStack } from '../stack/resource';
import { EcsServiceStack } from '../stack/service';

StackDescriptor.init();

const app = new App();
const env = {
   region: config.aws.region,
   account: config.aws.account,
};

new ResourceStack(app, 'resource', { env });
new EcsServiceStack(app, 'service', { env });
