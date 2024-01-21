import type { Stack } from 'aws-cdk-lib';
import { container } from 'tsyringe';
import { FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';

import { Container } from '../container';
import { TaskSchema } from './task.schema';

export function TaskDefinitionDescriptor() {
   return function <T extends { new (...args: any[]): FargateTaskDefinition }>(constructor: T) {
      return class extends constructor {
         constructor(...args: any[]) {
            super(...args);

            const schema = container.resolve(TaskSchema);
            schema.registerTaskDefinition({
               cpu: this['_cpu'],
               memory: this['_memory'],
               family: this.family,
               networkMode: this.networkMode,
               compatibility: this.compatibility,
               region: this.stack.region,
               account: this.stack.account,
            });
         }
      };
   };
}

export function containerDescriptor() {
   return function <T extends { new (...args: any[]): Container }>(constructor: T) {
      return class extends constructor {
         constructor(...args: any[]) {
            super(...args);

            const taskdef = container.resolve(TaskSchema);

            taskdef.registerContainer({
               cpu: this.container.cpu,
               essential: this.container.essential,
               containerName: this.container.containerName,
               portMappings: this.container.portMappings,
               imageName: this.container.imageName,
            });
         }
      };
   };
}

export function templateProducer() {
   return function <T extends { new (...args: any[]): Stack }>(constructor: T) {
      return class extends constructor {
         constructor(...args: any[]) {
            super(...args);

            const taskdef = container.resolve(TaskSchema);
            taskdef.produceTemplates();
         }
      };
   };
}
