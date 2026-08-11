import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Temple Seva Billing API running at http://0.0.0.0:${env.PORT}`);
  } catch (err) {
    console.error('Fatal error starting application server:', err);
    process.exit(1);
  }
}

start();
