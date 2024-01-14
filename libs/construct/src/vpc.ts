import type { Construct } from 'constructs';
import type { IIpAddresses, IVpc } from 'aws-cdk-lib/aws-ec2';

import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Vpc as VpcConstruct, VpcProps as VpcConstructProps } from 'aws-cdk-lib/aws-ec2';
import { Parameter } from './paramter';

export interface VpcProps extends Partial<VpcConstructProps> {
   ipAddresses?: IIpAddresses;
   parameterName?: string;
}

export class Vpc extends VpcConstruct {
   static readonly exportParamterName = '/vpc/id';

   constructor(scope: Construct, id: string, props: VpcProps) {
      super(scope, id, {
         subnetConfiguration: [
            {
               cidrMask: 24,
               name: 'public',
               subnetType: SubnetType.PUBLIC,
            },
            {
               cidrMask: 24,
               name: 'private',
               subnetType: SubnetType.PRIVATE_WITH_EGRESS,
            },
            {
               cidrMask: 28,
               name: 'isolated',
               subnetType: SubnetType.PRIVATE_ISOLATED,
            },
         ],
         ...props,
      });

      new StringParameter(this, 'VpcId', {
         stringValue: this.vpcId,
         parameterName: props.parameterName || Vpc.exportParamterName,
      });
   }

   public static vpcLookup(scope: Construct, id: string, parameterName?: string): IVpc {
      return Vpc.fromLookup(scope, id, {
         vpcId: Parameter.stringValue(scope, parameterName || Vpc.exportParamterName),
      });
   }

   public static getAllSubnetIds(vpc: IVpc): string[] {
      return [
         vpc.privateSubnets.map((subnet) => subnet.subnetId),
         vpc.publicSubnets.map((subnet) => subnet.subnetId),
         vpc.isolatedSubnets.map((subnet) => subnet.subnetId),
      ].flat();
   }

   public static getAllRouteTableIds(vpc: IVpc): string[] {
      return [
         vpc.publicSubnets.map((subnet) => subnet.routeTable.routeTableId),
         vpc.isolatedSubnets.map((subnet) => subnet.routeTable.routeTableId),
         vpc.privateSubnets.map((subnet) => subnet.routeTable.routeTableId),
      ].flat();
   }
}
