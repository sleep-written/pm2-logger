import { PM2 } from '@pm2-logger/utils';


const log: string[] = [];
const pm2 = new PM2();
const { controller, execute } = pm2.log(
    1, 
    chunk => log.push(chunk.toString('utf-8'))
);

setTimeout(
    () => controller.abort(),
    3000
);

await execute();
