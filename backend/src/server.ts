import { createApp } from './app';
import { env } from './config/env';

createApp().listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));
