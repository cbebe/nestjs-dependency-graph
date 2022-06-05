import { Module } from "@nestjs/common";
import { DependencyGraphController } from "./dependency-graph.controller";
import { DependencyGraphService } from "./dependency-graph.service";

@Module({
  providers: [DependencyGraphService],
  controllers: [DependencyGraphController],
})
export class DependencyGraphModule {}
