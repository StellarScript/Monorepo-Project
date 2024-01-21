import { Construct } from 'constructs';
import { Tag } from 'aws-cdk-lib';

export class TagStack {
   constructor(scope: Construct, tags: Record<string, string>[]) {
      for (const tag of tags) {
         for (const [key, value] of Object.entries(tag)) {
            new Tag(key, value).visit(scope);
         }
      }
   }
}
