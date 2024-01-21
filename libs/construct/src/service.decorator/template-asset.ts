import type { Construct } from 'constructs';

import { container } from 'tsyringe';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { TemplateSchema, TemplateType } from './task.schema';

export interface TemplateAssetProps {
   type: TemplateType;
}

export class TemplateAsset extends Asset {
   constructor(scope: Construct, id: string, props: TemplateAssetProps) {
      const schema = container.resolve(TemplateSchema);
      const outputPath = schema.templateFactory(props.type);

      super(scope, id, { path: outputPath });
   }
}
