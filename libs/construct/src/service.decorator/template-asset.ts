import type { Construct } from 'constructs';
import type { IGrantable } from 'aws-cdk-lib/aws-iam';

import { container } from 'tsyringe';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { TemplateSchema } from './task.schema';

export enum TemplateType {
   TASK_DEF = 'taskdef',
   APP_SPEC = 'appspec',
   IMAGE_DEF = 'imageDetails',
}

export class TemplateAsset extends Asset {
   constructor(scope: Construct, id: string, type: TemplateType) {
      const schema = container.resolve(TemplateSchema);
      const outputPath = schema.templateFactory(type);

      super(scope, id, { path: outputPath });
   }
}
