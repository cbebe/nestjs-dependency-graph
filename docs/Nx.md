# Usage with Nx

[Nx](https://nx.dev/packages/nest) builds NestJS applications with Webpack by default, resulting in a single file which has no exports. The JS output files emitted by `tsc` will also not resolve the module paths in `tsconfig.base.json` (see [microsoft/TypeScript#26722](https://github.com/microsoft/TypeScript/issues/26722)) and therefore cannot be run on their own if you use module paths. To get around this, create a new target in your application's `project.json` (`my-app` in this example):

```json
    "make-raw": {
      "builder": "@nrwl/workspace:run-commands",
      "options": {
        "commands": [
          "tsc --project apps/my-app/tsconfig.app.json",
          "nest-dg-resolve"
        ],
        "parallel": false
      }
    }
```

And then run `nx make-raw my-app`. This creates a new directory called `dist/resolved` where `nest-dg` can be run properly.

### Add to `package.json` scripts

```json
  "scripts": {
    "nest-dep-graph": "nx make-raw app && nest-dg dist/resolved/apps/my-app/src/app.module.js"
  }
```

Don't forget to update the path to your root app.module file.
