import { createServer } from 'vite';

async function start() {
  try {
    const server = await createServer({
      configFile: './vite.config.js',
      root: process.cwd(),
      server: {
        port: 5173,
        host: '0.0.0.0',
        open: false
      }
    });
    await server.listen();
    console.log('Vite Dev Server is running at http://localhost:5173');
  } catch (err) {
    console.error('Failed to start Vite server:', err);
  }
}

start();
