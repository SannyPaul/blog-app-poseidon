import type { Plugin } from 'vite';

export default function vitePluginSingleFile(): Plugin {
  return {
    name: 'vite-plugin-singlefile',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, _, next) => {
          if (req.url && !req.url.startsWith('/api') && !req.url.includes('.')) {
            req.url = '/';
          }
          next();
        });
      };
    },
  };
}
