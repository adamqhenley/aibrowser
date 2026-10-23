import {build} from 'esbuild';
await build({entryPoints:['vendor/siwc-local/src/index.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'build/siwc.mjs'});
