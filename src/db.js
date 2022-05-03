const knex = require("knex");
const knexConfig = require("../knexfile")

const _config = knexConfig[process.env.NODE_ENV || "development"];
module.exports = knex(_config);