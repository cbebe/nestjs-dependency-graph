# Nest.js dependency graph

## Installing as dependency

```bash
npm install --global nestjs-dependency-graph
```

### Add to `package.json` scripts

```json
  "scripts": {
    "nest-dep-graph": "nest-dg dist/app/app.module.js"
  }
```

Don't forget to update the path to your root app.module file.

### Run

```bash
  npm run build
  npm run nest-dep-graph
```

Open `http//:localhost:3000`

### Usage with Nx

See [docs/Nx.md](docs/Nx.md) for information.
