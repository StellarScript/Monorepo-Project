import type { Construct } from 'constructs';
import type { BuildSpec, IBuildImage, ProjectProps } from 'aws-cdk-lib/aws-codebuild';

import { Stack } from 'aws-cdk-lib';
import { Project } from 'aws-cdk-lib/aws-codebuild';
import { ComputeType, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';

export interface CodeBuildProjectProps extends Partial<ProjectProps> {
   buildSpec: BuildSpec;
   environment?: BuildEnvironment;
}

export class BuildEnvironment {
   computeType: ComputeType;
   buildImage: IBuildImage;

   constructor(type: ComputeType, image: IBuildImage) {
      this.buildImage = image;
      this.computeType = type;
   }
}

export class CodeBuildProject extends Project {
   public static env<T>(value: T) {
      return { value };
   }

   constructor(scope: Construct, id: string, props: CodeBuildProjectProps) {
      super(scope, id, {
         environment: new BuildEnvironment(ComputeType.SMALL, LinuxBuildImage.AMAZON_LINUX_2_5),
         ...props,

         environmentVariables: {
            REGION: { value: Stack.of(scope).region },
            ACCOUNT: { value: Stack.of(scope).account },
            ...props.environmentVariables,
         },
      });
   }
}
