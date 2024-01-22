import type { Construct } from 'constructs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';

export class RepositoryImage {
   public static FromRepository(scope: Construct, name: string, tag: string): ContainerImage {
      const repository = Repository.fromRepositoryName(scope, `${name}-image`, name);
      return ContainerImage.fromEcrRepository(repository, tag);
   }
}
