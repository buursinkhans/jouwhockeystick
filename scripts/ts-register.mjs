// Loaded with `node --import`: registers the resolve hook in ts-resolve.mjs.
import { register } from 'node:module';

register('./ts-resolve.mjs', import.meta.url);
