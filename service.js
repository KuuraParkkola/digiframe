const koa = require('koa');
const mount = require('koa-mount');
const static = require('koa-static');
const SocketIo = require('socket.io');

const http = require('http');
const path = require('path');

const knex = require('./modules/db');

const app = new koa();

const albumManager = require('./modules/albums').makeInstance('library');
const frameManager = require('./modules/frames').makeInstance();

app
    .use(mount('/frame', static(path.join(__dirname, 'frame', 'build'))))

const server = http.createServer(app.callback());

const io = SocketIo(server);
io.of('/frame').on("connect", frameManager.onConnect);

server.listen(5000, 'localhost');

console.log("app running");
