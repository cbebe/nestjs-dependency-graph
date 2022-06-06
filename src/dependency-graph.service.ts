import { DynamicModule, Injectable } from "@nestjs/common";
import { GLOBAL_MODULE_METADATA, MODULE_METADATA } from "@nestjs/common/constants";
import "reflect-metadata";

type ModuleClass = any;
type ProviderClass = any;

export interface ModuleData {
  module: ModuleClass;
  meta: {
    imports: ModuleData[];
    providers: ProviderClass[];
    controllers: ProviderClass[];
    exports: ProviderClass[];
    isGlobal: boolean;
  };
}

export type GraphData = { name: string; children?: GraphData[] };

@Injectable()
export class DependencyGraphService {
  private _graphData: GraphData;

  async setRootModule(moduleClass: ModuleData) {
    const data = await scanModule(moduleClass);
    this._graphData = mapToGraphStructure(data);
  }

  get graphData() {
    return this._graphData;
  }
}

const mapToGraphStructure = (moduleData: ModuleData): GraphData => ({
  name: `${moduleData.module.module?.name || moduleData.module.name}${moduleData.meta.isGlobal ? ` | GLOBAL` : ""}`,
  children: moduleData.meta.imports.map(mapToGraphStructure) || [],
});

async function scanModule(moduleClass: ModuleData): Promise<ModuleData> {
  const isDynamicModule = (mod: ModuleClass): boolean => mod && !!(mod as DynamicModule).module;
  const getMeta = (key: string): (ModuleClass | ProviderClass)[] => Reflect.getMetadata(key, moduleClass) || [];

  moduleClass = await Promise.resolve(moduleClass);
  const data: ModuleData = {
    module: moduleClass,
    meta: {
      imports: await Promise.all(getMeta(MODULE_METADATA.IMPORTS).map(scanModule)),
      providers: getMeta(MODULE_METADATA.PROVIDERS),
      controllers: getMeta(MODULE_METADATA.CONTROLLERS),
      exports: getMeta(MODULE_METADATA.EXPORTS),
      isGlobal: !!Reflect.getMetadata(GLOBAL_MODULE_METADATA, module),
    },
  };

  if (isDynamicModule(moduleClass)) {
    const dynModuleImports = ((moduleClass as DynamicModule).imports as ModuleData[]) || [];
    data.meta.imports = data.meta.imports.concat(await Promise.all(dynModuleImports.map(scanModule)));
    data.meta.providers = data.meta.providers.concat((moduleClass as DynamicModule).providers || []);
    data.meta.controllers = data.meta.controllers.concat((moduleClass as DynamicModule).controllers || []);
    data.meta.exports = data.meta.exports.concat((moduleClass as DynamicModule).exports || []);
  }

  return data;
}
