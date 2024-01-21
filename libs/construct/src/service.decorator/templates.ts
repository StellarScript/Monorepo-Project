import * as fs from 'fs';

abstract class Directory {
   protected abstract outDir: string;
   protected outputPath: string;

   public get outFilePath(): string {
      return this.outputPath;
   }

   public ensureDirectory() {
      if (!fs.existsSync(this.outDir)) {
         fs.mkdirSync(this.outDir);
      }
   }

   protected generate<T>(outfile: string, content: T) {
      this.ensureDirectory();
      const outPath = `${this.outDir}/${outfile}`;
      const template = JSON.stringify(content);
      fs.writeFileSync(outPath, template);
      this.outputPath = outPath;
   }
}

export class TaskDefTemplate<T> extends Directory {
   public static outFile = 'taskdef.json';

   constructor(protected outDir: string, content: T) {
      super();
      this.generate(TaskDefTemplate.outFile, content);
   }
}

export class AppSpecTemplate extends Directory {
   public static outFile = 'appspec.yaml';

   constructor(protected outDir: string, content: { ContainerName: string; ContainerPort: number }) {
      super();

      this.generate(AppSpecTemplate.outFile, {
         version: 0,
         Resources: [
            {
               TargetService: {
                  Type: 'AWS::ECS::Service',
                  Properties: {
                     TaskDefinition: '$TASK_DEFINITION_ARN',
                     LoadBalancerInfo: content,
                  },
               },
            },
         ],
      });
   }
}

export class ImageDefTemplate<T> extends Directory {
   public static outFile = 'imageDetails.json';

   constructor(protected outDir: string, content: T) {
      super();
   }
}
