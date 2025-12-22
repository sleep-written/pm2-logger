import { PM2 } from '@pm2-logger/utils';


const pm2 = new PM2();
const { controller, execute } = pm2.log(
    2, 
    chunk => {
        const message = chunk.toString('utf-8');
        console.log(message);
    }
);

setTimeout(
    () => controller.abort(),
    3000
);

await execute();
