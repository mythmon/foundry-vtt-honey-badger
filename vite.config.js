import copy from "rollup-plugin-copy";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    cleanDir: true,
    sourcemap: true,
    rolldownOptions: {
      input: "src/ts/module.ts",
      output: {
        preserveModules: true,
        dir: "dist/scripts",
        entryFileNames: "[name].js",
        format: "es",
      }
    },
  },
  plugins: [
    copy({
      targets: [{ src: "src/module.json", dest: "dist" }],
      hook: "writeBundle",
    }),
  ],
});
