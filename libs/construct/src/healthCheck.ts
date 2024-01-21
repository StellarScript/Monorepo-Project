import { Duration } from 'aws-cdk-lib/core';

interface HealthCheckProps {
   readonly path: string;
   readonly timeout?: Duration;
   readonly healthyThresholdCount?: number;
   readonly unhealthyThresholdCount?: number;
   readonly healthyHttpCodes?: string;
}

export class HealthCheck {
   public readonly path: string;
   public readonly timeout: Duration;
   public readonly healthyHttpCodes: string;
   public readonly healthyThresholdCount: number;
   public readonly unhealthyThresholdCount: number;

   constructor(props: HealthCheckProps) {
      this.path = props.path;
      this.timeout = props.timeout || Duration.seconds(5);
      this.healthyHttpCodes = props.healthyHttpCodes || '200-299';
      this.healthyThresholdCount = props.healthyThresholdCount || 2;
      this.unhealthyThresholdCount = props.unhealthyThresholdCount || 2;
   }
}
