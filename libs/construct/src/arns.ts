export class Arn {
   public static Alb(region: string, account: string, albName: string): string {
      return `arn:aws:elasticloadbalancing:${region}:${account}:loadbalancer/${albName}`;
   }

   public static VpcRouteTable(region: string, account: string, routeTableId: string): string {
      return `arn:aws:ec2:${region}:${account}:route-table/${routeTableId}`;
   }

   public static VpcSubnet(region: string, account: string, subnetId: string): string {
      return `arn:aws:ec2:${region}:${account}:subnet/${subnetId}`;
   }

   public static VpcInternetGateway(region: string, account: string, igId: string): string {
      return `arn:aws:ec2:${region}:${account}:internet-gateway/${igId}`;
   }

   public static Vpc(region: string, account: string, vpcId: string): string {
      return `arn:aws:ec2:${region}:${account}:vpc/${vpcId}`;
   }

   public static SecurityGroup(region: string, account: string, id: string): string {
      return `arn:aws:ec2:${region}:${account}:security-group/${id}`;
   }

   public static ElasticIp(region: string, account: string, id: string): string {
      return `arn:aws:ec2:${region}:${account}:elastic-ip/${id}`;
   }

   public static Parameter(region: string, account: string, id: string): string {
      return `arn:aws:ssm:${region}:${account}:parameter/${id}`;
   }
}
