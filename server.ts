import express, { Application } from "express";
import http from "http";
import AppRouter from "./API";
require("dotenv").config();
const cors = require('cors')

//defining port for server
const port = Number(process.env.SERVER_PORT)||5000;

//creating express application
const app: Application = express();

//parsing json requests and enables cross-origin resource sharing
app.use(express.json());
app.use(cors() )

//using the api router api route
app.use('/api', AppRouter)

//creating http server
const server = http.createServer(app);

//starting the server on the defined port
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
