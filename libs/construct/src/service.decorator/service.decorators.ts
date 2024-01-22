import { container } from 'tsyringe';
import { TaskDefinition } from 'aws-cdk-lib/aws-ecs';

import { Container } from '../container';
import { TemplateSchema } from './task.schema';

export function TaskDefinitionDescriptor() {
   return function <T extends { new (...args: any[]): TaskDefinition }>(constructor: T) {
      return class extends constructor {
         constructor(...args: any[]) {
            super(...args);

            const schema = container.resolve(TemplateSchema);
            schema.registerTaskDefinition({
               cpu: this['_cpu'],
               memory: this['_memory'],
               family: this.family,
               networkMode: this.networkMode,
               compatibility: this.compatibility,
               region: this.stack.region,
               account: this.stack.account,
               executionRoleName: this.executionRole['physicalName'],
            });
         }
      };
   };
}

export function ContainerDescriptor() {
   return function <T extends { new (...args: any[]): Container }>(constructor: T) {
      return class extends constructor {
         constructor(...args: any[]) {
            super(...args);

            const taskdef = container.resolve(TemplateSchema);

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
