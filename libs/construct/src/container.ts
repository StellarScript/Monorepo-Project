import type {
   TaskDefinition,
   ContainerDefinition,
   ContainerDefinitionOptions,
} from 'aws-cdk-lib/aws-ecs';
import { ContainerImage, AwsLogDriver } from 'aws-cdk-lib/aws-ecs';
import { RepositoryImage } from './repository';

interface ContainerProps extends Partial<ContainerDefinitionOptions> {
   readonly tag: string;
   readonly log?: boolean;
}

export interface IContainer {
   readonly image: ContainerImage;
   readonly logging?: AwsLogDriver;
   readonly container: ContainerDefinition;
}

export class Container implements IContainer {
   public readonly image: ContainerImage;
   public readonly logging?: AwsLogDriver;
   public readonly container: ContainerDefinition;

   constructor(scope: TaskDefinition, containerName: string, props: ContainerProps) {
      this.image = RepositoryImage.FromRepository(scope, containerName, props.tag);
      this.logging = props.log && new AwsLogDriver({ streamPrefix: containerName });

      this.container = scope.addContainer(containerName, {
         ...props,
         image: this.image,
         logging: this.logging,
      });
   }
}
