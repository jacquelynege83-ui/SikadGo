import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import fs from 'fs';
import { dbConnection } from './config/db_access.js';
import checkOfflineDevices from './functions/checkOfflineDevices.js';
import deviceRouter from './routers/device.router.js';
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

const secretPath =
  fs.existsSync('/etc/secrets/.env')
    ? '/etc/secrets/.env'
    : './.env';

dotenvConfig({ path: secretPath});

app.get("/", (req, res) =>{
    res.json({message: "Server is working!"})
});
app.use("/device", deviceRouter);

setInterval(checkOfflineDevices, 30000);

app.listen(PORT, ()=>{
    dbConnection();
    console.log("Server started at http://localhost:"+PORT);
});
