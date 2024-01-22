import 'reflect-metadata';

import { App } from 'aws-cdk-lib';
import { it, describe, beforeAll } from 'vitest';
import { Template } from 'aws-cdk-lib/assertions';
import { EcsServiceStack } from '../src/stack/service';

describe('Service Stack', () => {
   let stack: EcsServiceStack;

   beforeAll(() => {
      const app = new App();
      stack = new EcsServiceStack(app, 'service-stack', {
         env: { account: '123456789012', region: 'us-east-2' },
      });
   });

   it('service stack cluster', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::ECS::Cluster', {
         ClusterSettings: [{ Name: 'containerInsights', Value: 'enabled' }],
      });
   });

   it('service stack task definition', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::ECS::TaskDefinition', {
         Family: 'appify',
         NetworkMode: 'awsvpc',
         RequiresCompatibilities: ['FARGATE'],
      });
   });

   it('service stack task definition', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::EC2::SecurityGroup', {
         GroupDescription: 'Ecs Fargate Service Security Group',
         SecurityGroupEgress: [
            {
               CidrIp: '0.0.0.0/0',
               Description: 'Allow all outbound traffic by default',
               IpProtocol: '-1',
            },
         ],
         VpcId: 'vpc-12345',
      });
   });

   it('service stack ecs service', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::ECS::Service', {
         DeploymentConfiguration: { MaximumPercent: 200, MinimumHealthyPercent: 50 },
         DeploymentController: { Type: 'CODE_DEPLOY' },
         EnableECSManagedTags: false,
         EnableExecuteCommand: true,
         HealthCheckGracePeriodSeconds: 60,
         LaunchType: 'FARGATE',
         PropagateTags: 'TASK_DEFINITION',
         TaskDefinition: 'appify',

         LoadBalancers: [
            {
               ContainerName: 'client',
               ContainerPort: 3000,
            },
            {
               ContainerName: 'client',
               ContainerPort: 3000,
            },
         ],
         NetworkConfiguration: {
            AwsvpcConfiguration: {
               AssignPublicIp: 'DISABLED',
            },
         },
      });
   });

   it('service stack ecs service', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
         DefaultActions: [{ Type: 'forward' }],
         Protocol: 'HTTPS',
         Port: 443,
      });
   });

   it('service stack blue target group', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
         HealthCheckPath: '/',
         HealthCheckTimeoutSeconds: 5,
         HealthyThresholdCount: 2,
         Port: 3000,
         Protocol: 'HTTP',
         TargetType: 'ip',
         VpcId: 'vpc-12345',
         UnhealthyThresholdCount: 2,
         Matcher: { HttpCode: '200-299' },
         TargetGroupAttributes: [{ Key: 'stickiness.enabled', Value: 'false' }],
      });
   });

   it('service stack green target group', () => {
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
         HealthCheckPath: '/',
         HealthCheckTimeoutSeconds: 5,
         HealthyThresholdCount: 2,
         Port: 3000,
         Protocol: 'HTTP',
         TargetType: 'ip',
         VpcId: 'vpc-12345',
         UnhealthyThresholdCount: 2,
         Matcher: { HttpCode: '200-299' },
      });
   });
});
