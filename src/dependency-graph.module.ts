import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { DependencyGraphController } from "./dependency-graph.controller";
import { DependencyGraphService } from "./dependency-graph.service";

@Module({
  imports: [
    // fastify-static is deprecated. Watch for this PR:
    // https://github.com/nestjs/serve-static/pull/872
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "static"),
    }),
  ],
  providers: [DependencyGraphService],
  controllers: [DependencyGraphController],
})
export class DependencyGraphModule {}
