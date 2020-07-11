/*
 * Created by Shuqiao Zhang in 2020.
 * https://zhangshuqiao.org
 */

/*
 * This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 */

const express = require("express");
const path = require("path");
const os = require("os");
const chalk = require("chalk");
const { exec } = require("child_process");

const app = express();

var config = require("./config.json");

config.dev ? exec("npm run build-dev") : exec("npm run build");
if (!(config.port >= 0 && config.port < 65536 && config.port % 1 === 0)) {
    console.error("[ERROR] `port` argument must be an integer >= 0 and < 65536. Default value will be used.");
    config.port = 8080;
}
var port = process.env.PORT || config.port;

const http = require("http");
const server = http.createServer(app);

server.listen(port, () => {
    console.log(chalk.yellow("Server available on:"));
    const ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(dev => {
        ifaces[dev].forEach(details => {
            if (details.family === 'IPv4') {
                console.log((`  http://${details.address}:${chalk.green(port.toString())}`));
            }
        });
    });
    console.log("Hit CTRL-C to stop the server");
});
//Routing
app.use(express.static(path.join(__dirname, "public")));
