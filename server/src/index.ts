import express from 'express';

import { apiRouting } from './api/routing.js';

const app = express();
app.use(apiRouting);
app.listen(8080, () => {
    console.log('ready!');
});