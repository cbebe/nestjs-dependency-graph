import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join, relative, resolve } from "path";
import readdirp from "readdirp";

function getAllJsFiles(dir: string): Promise<string[]> {
  return new Promise((resolve) => {
    const allFilePaths: string[] = [];
    readdirp(dir, { fileFilter: ["*.js"] })
      .on("data", function (entry) {
        allFilePaths.push(entry.fullPath);
      })
      .on("warn", function (warn) {
        process.stderr.write("readdirp Warn: " + warn + "\n");
      })
      .on("error", function (err) {
        process.stderr.write("readdirp Error: " + err.stack + "\n");
      })
      .on("end", function () {
        resolve(allFilePaths);
      });
  });
}

async function main() {
  const inputDir = resolve(process.cwd(), "dist/out-tsc");
  const outputDir = resolve(process.cwd(), "dist/resolved");
  const allJs = await getAllJsFiles(inputDir);

  const config = JSON.parse((await readFile(resolve(process.cwd(), "tsconfig.base.json"))).toString());
  const paths = config.compilerOptions.paths;

  async function replaceImports(file: string) {
    const newFile = join(outputDir, relative(inputDir, file));
    const dir = dirname(newFile);
    const contents = (await readFile(file)).toString();
    const replaced = contents
      .split("\n")
      .map((line) => {
        const match = line.match(/require\("([^)]+)"\);/);
        if (!match || !paths[match[1]]) return line;
        const tsModule = paths[match[1]][0] + ".js";
        return line.replace(match[1], relative(dir, resolve(outputDir, tsModule)));
      })
      .join("\n");
    await mkdir(dir, { recursive: true });
    await writeFile(newFile, replaced);
  }

  await Promise.all(allJs.map(replaceImports));
}

main();
