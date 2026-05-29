import fs from "fs";
import { defineConfig } from "vite";

function moduleJsonPlugin() {
  return {
    name: "module-json",
    generateBundle(_options, bundle) {
      const entryFiles = Object.values(bundle)
        .filter(chunk => chunk.type === "chunk" && chunk.isEntry)
        .map(chunk => chunk.fileName);

      const moduleJson = JSON.parse(fs.readFileSync("src/module.json", "utf-8"));
      moduleJson.esmodules = entryFiles;

      this.emitFile({
        type: "asset",
        fileName: "module.json",
        source: JSON.stringify(moduleJson, null, 2),
      });
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist",
    cleanDir: true,
    sourcemap: true,
    rolldownOptions: {
      input: "src/ts/main.ts",
      output: {
        preserveModules: true,
        dir: "dist",
        entryFileNames: "[name].js",
        format: "es",
      }
    },
  },
  plugins: [moduleJsonPlugin()],
});
