import { DynamicModule, Injectable } from "@nestjs/common";

interface ModuleData {
  module: any;
  meta: {
    imports: ModuleData[];
    providers: any[];
    controllers: any[];
    exports: any[];
    isGlobal: boolean;
  };
}

@Injectable()
export class DependencyGraphService {
  private graphData: any;

  constructor() {}

  async setRootModule<T>(module: T) {
    const data = await this.scanModule(module);
    this.graphData = await this.mapToGraphStructure(data);
  }

  getGraphData() {
    return this.graphData;
  }

  private mapToGraphStructure(moduleData: any) {
    let name = moduleData.module.module
      ? moduleData.module.module.name
      : moduleData.module.name;
    name = moduleData.meta.isGlobal ? `${name} | GLOBAL` : name;
    return {
      name,
      children: moduleData.meta.imports.map((m) => this.mapToGraphStructure(m)),
    };
  }

  private async scanModule<T extends DynamicModule>(
    module: T
  ): Promise<ModuleData> {
    const isDynamicModule = (mod: T): boolean =>
      mod && !!(mod as DynamicModule).module;
    const getMeta = (key: any): any[] => Reflect.getMetadata(key, module) || [];

    module = await Promise.resolve(module);
    const data: ModuleData = {
      module,
      meta: {
        imports: await Promise.all(getMeta().map((m) => this.scanModule(m))),
        providers: getMeta(MODULE_METADATA.PROVIDERS),
        controllers: getMeta(MODULE_METADATA.CONTROLLERS),
        exports: getMeta(MODULE_METADATA.EXPORTS),
        isGlobal: !!Reflect.getMetadata(GLOBAL_MODULE_METADATA, module),
      },
    };

    if (isDynamicModule(module)) {
      const dynModuleImports = (module as DynamicModule).imports || [];
      data.meta.imports = data.meta.imports.concat(
        await Promise.all(dynModuleImports.map((m) => this.scanModule(m)))
      );
      data.meta.providers = data.meta.providers.concat(
        (module as DynamicModule).providers || []
      );
      data.meta.controllers = data.meta.controllers.concat(
        (module as DynamicModule).controllers || []
      );
      data.meta.exports = data.meta.exports.concat(
        (module as DynamicModule).exports || []
      );
    }

    return data;
  }
}
