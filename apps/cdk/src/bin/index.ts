#!/usr/bin/env node
import 'source-map-support/register';

import { App } from 'aws-cdk-lib';
import { ResourceStack } from '../stack/resource';

const app = new App();
new ResourceStack(app, 'resource-stack');
