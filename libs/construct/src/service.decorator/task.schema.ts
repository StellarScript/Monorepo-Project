import { container, singleton } from 'tsyringe';
import { Compatibility as EcsCompatibility, PortMapping } from 'aws-cdk-lib/aws-ecs';
import { TaskDefTemplate, AppSpecTemplate, ImageDefTemplate } from './templates';
import { Arn } from '../arns';

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
}

interface TaskDefinitionProps {
   cpu: number;
   memory: number;
   family: string;
   networkMode: string;
   requiresCompatibilities: string[];
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

export enum TemplateType {
   TASK_DEF = 'taskdef',
   APP_SPEC = 'appspec',
   IMAGE_DEF = 'imageDetails',
}

@singleton()
export class TemplateSchema {
   taskDefinitionSchema: TaskDefinitionProps;
   containerDefinitions: Container[] = [];

   public registerTaskDefinition(taskDef: TaskDefinitionRaw): void {
      const taskDefinitionSchema = {
         family: taskDef.family,
         cpu: Number(taskDef.cpu),
         memory: Number(taskDef.memory),
         networkMode: taskDef.networkMode,
         requiresCompatibilities: [Compatibility[taskDef.compatibility]],
      };
      this.taskDefinitionSchema = { ...taskDefinitionSchema };
   }

   public registerContainer(container: ContainerRaw): void {
      const _container = {
         name: container.containerName,
         essential: container.essential,
         portMappings: container.portMappings,
         image: Arn.EcrImage('$REGION', '$ACCOUNT', container.imageName),
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

      if (type === TemplateType.IMAGE_DEF) {
         const template = new ImageDefTemplate(
            OUT_DIR,
            this.containerDefinitions.map((container) => ({
               name: container.name,
               imageUri: container.image,
            }))
         );
         return template.outFilePath;
      }

      if (type === TemplateType.APP_SPEC) {
         const { name, portMappings } = this.containerDefinitions.find(
            ({ essential }) => essential === true
         );

         const template = new AppSpecTemplate(OUT_DIR, {
            ContainerPort: portMappings[0].containerPort,
            ContainerName: name,
         });
         return template.outFilePath;
      }
   }
}
