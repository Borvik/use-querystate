import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'node:path';

const APP_ROOT = searchForWorkspaceRoot(process.cwd());
const NODE_MODULES = path.normalize(path.join(APP_ROOT, '../common/temp/node_modules'));

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        NODE_MODULES,
      ]
    }
  }
});
