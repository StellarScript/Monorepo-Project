import { Construct } from 'constructs';
import { Repository } from 'aws-cdk-lib/aws-ecr';

import type {
   LogDriver,
   TaskDefinition,
   ContainerDefinition,
   ContainerDefinitionOptions,
} from 'aws-cdk-lib/aws-ecs';
import { LogDrivers, ContainerImage } from 'aws-cdk-lib/aws-ecs';

export class RepositoryImage {
   public static FromRepository(scope: Construct, name: string, tag: string): ContainerImage {
      const repository = Repository.fromRepositoryName(scope, `${name}-image`, name);
      return ContainerImage.fromEcrRepository(repository, tag);
   }
}

interface ContainerProps extends Partial<ContainerDefinitionOptions> {
   readonly tag: string;
   readonly log?: boolean;
}

export class Container {
   public readonly image: ContainerImage;
   public readonly logging?: LogDriver;
   public readonly container: ContainerDefinition;

   constructor(scope: TaskDefinition, containerName: string, props: ContainerProps) {
      this.image = RepositoryImage.FromRepository(scope, containerName, props.tag);
      this.logging = props.log && LogDrivers.awsLogs({ streamPrefix: containerName });

      this.container = scope.addContainer(containerName, {
         ...props,
         image: this.image,
         logging: this.logging,
         containerName: containerName,
         cpu: props.cpu,
      });
   }
}
