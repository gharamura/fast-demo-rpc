const Router = require("koa-router");
const oc = require("./rpc/order.rpc.js");
const { validateCreateOrder } = require("./middlewares/createOrderValidator");
const { clearOrder } = require("./rpc/clearOrder.rpc.js");
const { executePayment } = require("./rpc/payment.rpc.js");

module.exports = (() => {
  const router = new Router();

  router.post("/rpc/order/create", validateCreateOrder, oc.create);
  router.delete("/rpc/cart/:id", clearOrder);
  router.post("/rpc/payment/:id", executePayment)
  
  return router;
})();
