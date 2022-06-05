import { Controller, Get, Response } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { createReadStream } from "fs";
import { resolve } from "path";
import { DependencyGraphService } from "./dependency-graph.service";

@Controller()
export class DependencyGraphController {
  constructor(private graphService: DependencyGraphService) {}

  @Get()
  async get(@Response() res: FastifyReply) {
    const stream = createReadStream(resolve(__dirname, "index.html"));
    res.type("text/html").send(stream);
  }

  @Get("tree-data")
  async treeData() {
    return JSON.stringify(this.graphService.getGraphData());
  }
}
