import { singleton } from 'tsyringe';
import { Compatibility as EcsCompatibility, PortMapping } from 'aws-cdk-lib/aws-ecs';
import { TaskDefTemplate, AppSpecTemplate, ImageDefTemplate } from './templates';
import { Arn } from '../arns';
import { TemplateType } from './template-asset';

interface Account {
   region: string;
   account: string;
}

interface TaskDefinitionRaw extends Account {
   cpu: string;
   memory: string;
   family: string;
   networkMode: string;
   compatibility: EcsCompatibility;
   executionRoleName: string;
}

interface TaskDefinitionProps {
   cpu: string;
   memory: string;
   family: string;
   networkMode: string;
   requiresCompatibilities: string[];
   executionRoleArn: string;
}

interface ContainerRaw {
   cpu?: number;
   memory?: number;
   containerName: string;
   imageName: string;
   essential: boolean;
   portMappings: PortMapping[];
}

interface Container {
   name: string;
   image: string;
   essential: boolean;
   portMappings: PortMapping[];
}

const Compatibility = {
   '0': 'EC2',
   '1': 'FARGATE',
   '2': 'EC2_AND_FARGATE',
   '3': 'EXTERNAL',
};

@singleton()
export class TemplateSchema {
   taskDefinitionSchema: TaskDefinitionProps;
   containerDefinitions: Container[] = [];

   public registerTaskDefinition(taskDef: TaskDefinitionRaw): void {
      const taskDefinitionSchema = {
         family: taskDef.family,
         cpu: taskDef.cpu,
         memory: taskDef.memory,
         networkMode: taskDef.networkMode,
         requiresCompatibilities: [Compatibility[taskDef.compatibility]],
         executionRoleArn: Arn.Role('ACCOUNT', taskDef.executionRoleName),
      };
      this.taskDefinitionSchema = { ...taskDefinitionSchema };
   }

   public registerContainer(container: ContainerRaw): void {
      const _container = {
         name: container.containerName,
         essential: container.essential,
         portMappings: container.portMappings,
         image: Arn.EcrImage('REGION', 'ACCOUNT', container.imageName.split('/')[1]),
      };
      this.containerDefinitions.push({ ..._container });
   }

   public templateFactory(type: TemplateType): string {
      const OUT_DIR = 'cdk.out/templates';

      if (type === TemplateType.TASK_DEF) {
         const template = new TaskDefTemplate(OUT_DIR, {
            ...this.taskDefinitionSchema,
            containerDefinitions: this.containerDefinitions,
         });
         return template.outFilePath;
      }

      if (type === TemplateType.APP_SPEC) {
         const { name, portMappings } = this.containerDefinitions.find(
            ({ essential }) => essential === true
         );

         const template = new AppSpecTemplate(OUT_DIR, {
            ContainerPort: portMappings[0].containerPort.toString(),
            ContainerName: name,
         });
         return template.outFilePath;
      }

      if (type === TemplateType.IMAGE_DEF) {
         const template = new ImageDefTemplate(
            OUT_DIR,
            this.containerDefinitions?.map((container) => ({
               name: container.name,
               imageUri: container.image,
            }))
         );
         return template.outFilePath;
      }
   }
}
