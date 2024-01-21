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

   public static SsmParameter(region: string, account: string, id: string): string {
      return `arn:aws:ssm:${region}:${account}:parameter/${id}`;
   }

   public static EcsCluster(region: string, account: string, clusterName: string): string {
      return `arn:aws:ecs:${region}:${account}:cluster/${clusterName}`;
   }

   public static Policy(account: string, policyName: string): string {
      return `arn:aws:iam::${account}:policy/${policyName}`;
   }

   public static Role(account: string, roleName: string): string {
      return `arn:aws:iam::${account}:role/${roleName}`;
   }

   public static LogGroup(region: string, account: string, logGroupName: string): string {
      return `arn:aws:logs:${region}:${account}:log-group:${logGroupName}`;
   }

   public static ElbTargetGroup(region: string, account: string, id: string, name: string): string {
      // check for name | id
      return `arn:aws:elasticloadbalancing:${region}:${account}:targetgroup/${id}/${name}`;
   }

   public static EcsService(region: string, account: string, id: string, name: string): string {
      return `arn:aws:ecs:${region}:${account}:service/${id}/${name}`;
   }
}
