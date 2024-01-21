import { container } from 'tsyringe';
import { TemplateSchema } from './task.schema';

export * from './template-asset';
export * from './service.decorators';

export class StackDescriptor {
   public static register(): void {
      container.resolve(TemplateSchema);
   }
}
