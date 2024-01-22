import 'reflect-metadata';

import { it, describe, beforeAll } from 'vitest';
import { Template } from 'aws-cdk-lib/assertions';

import { App } from 'aws-cdk-lib';
import { EcsServiceStack } from '../src/stack/service';

describe('Deployment Pipeline Construct', () => {
   let stack: EcsServiceStack;

   beforeAll(() => {
      const app = new App();
      stack = new EcsServiceStack(app, 'resource-stack', {
         env: { account: '123456789012', region: 'us-east-1' },
      });
   });

   it('pipeline client source action', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Events::Rule', {
         State: 'ENABLED',
         EventPattern: {
            source: ['aws.ecr'],
            'detail-type': ['ECR Image Action'],
            detail: {
               result: ['SUCCESS'],
               'repository-name': ['client'],
               'image-tag': ['latest'],
               'action-type': ['PUSH'],
            },
         },
      });
   });

   it('pipeline server source action', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Events::Rule', {
         State: 'ENABLED',
         EventPattern: {
            'detail-type': ['ECR Image Action'],
            source: ['aws.ecr'],
            detail: {
               result: ['SUCCESS'],
               'repository-name': ['server'],
               'image-tag': ['latest'],
               'action-type': ['PUSH'],
            },
         },
      });
   });

   it('pipeline codebuild project', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::CodeBuild::Project', {
         Cache: { Type: 'NO_CACHE' },
         Environment: {
            ComputeType: 'BUILD_GENERAL1_SMALL',
            Image: 'aws/codebuild/amazonlinux2-x86_64-standard:5.0',
            ImagePullCredentialsType: 'CODEBUILD',
            PrivilegedMode: false,
            Type: 'LINUX_CONTAINER',
         },
      });
   });

   it('pipeline deployment group', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::CodeDeploy::DeploymentGroup', {
         ApplicationName: { Ref: 'deploymentpipelinecodedeployGroupApplicationA8456A27' },
         AutoRollbackConfiguration: { Enabled: true, Events: ['DEPLOYMENT_FAILURE'] },
         BlueGreenDeploymentConfiguration: {
            DeploymentReadyOption: { ActionOnTimeout: 'CONTINUE_DEPLOYMENT', WaitTimeInMinutes: 0 },
            TerminateBlueInstancesOnDeploymentSuccess: {
               Action: 'TERMINATE',
               TerminationWaitTimeInMinutes: 0,
            },
         },
         DeploymentConfigName: 'CodeDeployDefault.ECSAllAtOnce',
         DeploymentStyle: {
            DeploymentOption: 'WITH_TRAFFIC_CONTROL',
            DeploymentType: 'BLUE_GREEN',
         },
         ECSServices: [
            {
               ClusterName: { Ref: 'ecscluster7830E7B5' },
               ServiceName: { 'Fn::GetAtt': ['fargateserviceService16837280', 'Name'] },
            },
         ],
         LoadBalancerInfo: {
            TargetGroupPairInfoList: [
               {
                  ProdTrafficRoute: { ListenerArns: [{ Ref: 'alblookupsecurelistener77413B78' }] },
                  TargetGroups: [
                     { Name: { 'Fn::GetAtt': ['bluetargetGroup4989D527', 'TargetGroupName'] } },
                     { Name: { 'Fn::GetAtt': ['greentargetGroup1D17DC60', 'TargetGroupName'] } },
                  ],
               },
            ],
         },
      });
   });
});
