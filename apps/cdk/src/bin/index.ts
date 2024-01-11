#!/usr/bin/env node
import 'source-map-support/register';

import { App } from 'aws-cdk-lib';
import configuration from '@appify/shared/config';
import { ResourceStack } from '../stack/resource';

const app = new App();
const env = {
   region: configuration.aws.region,
   account: configuration.aws.account,
};

new ResourceStack(app, 'resource', { env });
