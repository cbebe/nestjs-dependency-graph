import { Controller, Get } from "@nestjs/common";
import { DependencyGraphService } from "./dependency-graph.service";

@Controller()
export class DependencyGraphController {
  constructor(private readonly graphService: DependencyGraphService) {}

  @Get("tree-data")
  public async treeData() {
    return `var treeData = [${JSON.stringify(this.graphService.graphData)}]`;
  }
}
