import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { existsSync } from "fs";
import { resolve } from "path";
import { DependencyGraphModule } from "./dependency-graph.module";
import { DependencyGraphService } from "./dependency-graph.service";

async function bootstrap() {
  const args = process.argv.slice(2);
  if (!args.length) {
    return console.error(
      "You need to pass root module path as first argument..."
    );
  }
  const modulePath = resolve(args[0]);
  if (!modulePath || !existsSync(modulePath)) {
    return console.error(`Cannot resolve path '${modulePath}'`);
  }

  const module = await import(modulePath);
  const moduleExports = Object.values(module);
  if (moduleExports.length === 0) {
    return console.error(
      `There are no exports in provided file, don't know which export to scan`
    );
  }
  if (moduleExports.length > 1) {
    return console.error(
      `There are multiple exports in provided file, don't know which export to scan`
    );
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    DependencyGraphModule,
    new FastifyAdapter()
  );

  const moduleClass = moduleExports[0];
  app.get(DependencyGraphService).setRootModule(moduleClass);

  await app.listen(3000, "127.0.0.1");
  await app.init();

  console.log("Graph ready on http://localhost:3000");
}

bootstrap();
