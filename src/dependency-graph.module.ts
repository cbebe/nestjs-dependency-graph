import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { DependencyGraphController } from "./dependency-graph.controller";
import { DependencyGraphService } from "./dependency-graph.service";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "static"),
    }),
  ],
  providers: [DependencyGraphService],
  controllers: [DependencyGraphController],
})
export class DependencyGraphModule {}
