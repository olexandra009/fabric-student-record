import express from 'express'
import { auth, record } from './routes';

const app = express();
app.use(express.urlencoded());

app.use(express.json());
app.use('/api/v1/auth/', auth);
app.use('/api/v1/record/', record);
const appPort = 3000;
app.listen(
    appPort,
    () => console.log(`Listening on port ${appPort}...`),
);
