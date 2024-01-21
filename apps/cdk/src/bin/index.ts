#!/usr/bin/env node
import 'source-map-support/register';

import { App } from 'aws-cdk-lib';
import { AppStack } from '../stack/app';

const app = new App();
new AppStack(app, 'cdk');
