import express from 'express';
import { dbConnection } from './config/db_access.js';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';

const app = express();

const PORT = process.env.PORT || 5000;

const secretPath =
  fs.existsSync('/etc/secrets/.env')
    ? '/etc/secrets/.env'
    : './.env';

dotenvConfig({ path: secretPath});


app.get("/", (req, res) =>{
    res.json({message: "Server is working!"})
});

app.listen(PORT, ()=>{
    dbConnection();
    console.log("Server started at http://localhost:"+PORT);
});
