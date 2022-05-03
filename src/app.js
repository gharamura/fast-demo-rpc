const Koa = require('koa');
const logger = require('koa-logger')
const bodyParser = require("koa-bodyparser");

const r = require("./router");

const app = new Koa();
app.use(logger());
app.use(bodyParser())
app.use(r.routes());

module.exports = app;