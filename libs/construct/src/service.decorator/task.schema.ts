import { Compatibility as EcsCompatibility, PortMapping } from 'aws-cdk-lib/aws-ecs';
import { container, singleton } from 'tsyringe';
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

@singleton()
export class TaskSchema {
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

   public registerContainer(container: ContainerRaw) {
      const _container = {
         name: container.containerName,
         essential: container.essential,
         portMappings: container.portMappings,
         image: Arn.EcrImage('$REGION', '$ACCOUNT', container.imageName),
      };
      this.containerDefinitions.push({ ..._container });
   }

   public produceTemplates() {
      //
   }
}

export class StackDescriptor {
   public static register(): void {
      container.resolve(TaskSchema);
   }
}
