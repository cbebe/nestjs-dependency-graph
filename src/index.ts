import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { existsSync } from "fs";
import { resolve } from "path";
import { DependencyGraphModule } from "./dependency-graph.module";
import { DependencyGraphService, ModuleData } from "./dependency-graph.service";

async function bootstrap() {
  const args = process.argv.slice(2);
  if (!args.length) throw new Error("You need to pass root module path as first argument...");

  const modulePath = resolve(args[0]);
  if (!modulePath || !existsSync(modulePath)) throw new Error(`Cannot resolve path '${modulePath}'`);

  const moduleExports = Object.values(await import(modulePath));
  if (moduleExports.length === 0) throw new Error("There are no exports in provided file");
  if (moduleExports.length > 1)
    throw new Error("There are multiple exports in provided file, don't know which export to scan");

  const app = await NestFactory.create<NestFastifyApplication>(DependencyGraphModule, new FastifyAdapter());

  app.get(DependencyGraphService).setRootModule(moduleExports[0] as ModuleData);

  await app.listen(3000, "127.0.0.1");

  process.stdout.write("Graph ready on http://localhost:3000\n");
}

async function main() {
  try {
    await bootstrap();
  } catch (err) {
    console.error(err);
  }
}

main();
