import type { Construct } from 'constructs';
import type { StackProps } from 'aws-cdk-lib';
import type { FargateService } from 'aws-cdk-lib/aws-ecs';
import type {
   ApplicationListener,
   ApplicationTargetGroup,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { Stack } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { EcsDeploymentConfig, EcsDeploymentGroup } from 'aws-cdk-lib/aws-codedeploy';
import {
   CodeBuildAction,
   EcrSourceAction,
   CodeDeployEcsDeployAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';

import { CodeBuildProject } from '@appify/construct/codebuild-project';
import { TemplateAsset, TemplateType } from '@appify/construct/service.decorator';
import { ImageTag } from '../pattern/constants';

export interface EcsDeploymentPipelineStackProps extends StackProps {
   readonly fargateService: FargateService;
   readonly listener: ApplicationListener;
   readonly blueTargetGroup: ApplicationTargetGroup;
   readonly greenTargetGroup: ApplicationTargetGroup;
}

export class EcsDeploymentPipelineStack extends Stack {
   constructor(scope: Construct, id: string, props: EcsDeploymentPipelineStackProps) {
      super(scope, id, { env: props.env });

      const clientSource = new Artifact('ClientSource');
      const serverSource = new Artifact('ServerSource');
      const buildArtifact = new Artifact('BuildArtifact');

      const taskDefAsset = new TemplateAsset(this, 'taskdef-asset', TemplateType.TASK_DEF);
      const appSpecAsset = new TemplateAsset(this, 'appspec-asset', TemplateType.APP_SPEC);
      const imageDefAsset = new TemplateAsset(this, 'image-asset', TemplateType.IMAGE_DEF);

      const clientSourceAction = this.ecrSourceAction('client', clientSource);
      const serverSourceAction = this.ecrSourceAction('server', serverSource);

      const buildProject = this.createBuildProject(props.fargateService, [
         taskDefAsset,
         appSpecAsset,
         imageDefAsset,
      ]);

      const buildAction = new CodeBuildAction({
         actionName: 'Build',
         input: new Artifact('SourceArtifact'),
         project: buildProject,
         outputs: [buildArtifact],
      });

      const deploymentGroup = new EcsDeploymentGroup(this, 'codedeploy-Group', {
         deploymentConfig: EcsDeploymentConfig.ALL_AT_ONCE,
         service: props.fargateService,
         blueGreenDeploymentConfig: {
            listener: props.listener,
            blueTargetGroup: props.blueTargetGroup,
            greenTargetGroup: props.greenTargetGroup,
         },
      });

      const deployAction = new CodeDeployEcsDeployAction({
         actionName: 'EcsDeployment',
         appSpecTemplateInput: buildArtifact,
         taskDefinitionTemplateInput: buildArtifact,
         deploymentGroup: deploymentGroup,
      });

      new Pipeline(this, 'deployment-pipeline', {
         pipelineName: 'EcsDeploymentPipeline',
         stages: [
            {
               stageName: 'Source',
               actions: [clientSourceAction, serverSourceAction],
            },
            {
               stageName: 'Build',
               actions: [buildAction],
            },
            {
               stageName: 'Deploy',
               actions: [deployAction],
            },
         ],
      });
   }

   private ecrSourceAction(name: string, sourceArtifact: Artifact): EcrSourceAction {
      const repository = Repository.fromRepositoryName(this, `${name}-ecrRepo`, name);
      return new EcrSourceAction({
         repository: repository,
         output: sourceArtifact,
         actionName: `${name}Source`,
         imageTag: ImageTag.Latest,
      });
   }

   private createBuildProject(service: FargateService, assets: TemplateAsset[]): CodeBuildProject {
      const [taskDefAsset, appSpecAsset, imageDefAsset] = assets;
      const buildProject = new CodeBuildProject(this, 'build-project', {
         buildSpec: BuildSpecTemplate(),
         environmentVariables: {
            TASK_DEF_TEMPLATE: CodeBuildProject.env(taskDefAsset.s3ObjectUrl),
            APP_SPEC_TEMPLATE: CodeBuildProject.env(appSpecAsset.s3ObjectUrl),
            IMAGE_DETAILS_TEMPLATE: CodeBuildProject.env(imageDefAsset.s3ObjectUrl),
            TASK_DEFINITION_ARN: CodeBuildProject.env(service.taskDefinition.taskDefinitionArn),
         },
      });
      taskDefAsset.grantRead(buildProject);
      appSpecAsset.grantRead(buildProject);
      imageDefAsset.grantRead(buildProject);
      return buildProject;
   }
}

function BuildSpecTemplate() {
   return BuildSpec.fromObject({
      version: '0.2',
      phases: {
         build: {
            commands: [
               'aws s3 cp $TASK_DEF_TEMPLATE ./taskdef.json',
               'aws s3 cp $APP_SPEC_TEMPLATE ./appspec.yaml',
               'aws s3 cp $IMAGE_DETAILS_TEMPLATE ./imagedetails.json',
            ],
         },
         post_build: {
            commands: [
               'sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" taskdef.json',
               'sed -i "s|REPOSITORY_URI|${REPOSITORY_URI}|g" taskdef.json',

               'sed -i "s|TASK_DEFINITION_ARN|${TASK_DEFINITION_ARN}|g" appspec.yaml',

               'cat appspec.yaml',
               'cat taskdef.json',

               'cp appspec.yaml ../',
               'cp taskdef.json ../',
               'cp imagedetails.json ../',
            ],
         },
      },
      artifacts: {
         files: ['taskdef.json', 'appspec.yaml', 'imagedetails.json'],
      },
   });
}
