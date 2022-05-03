const db = require("../db.js")
const cartService = require("../services/cart.services.js");

module.exports.detail = async (ctx, next) => {

  const { cart_id } = ctx.request.body;
  const detailedCart = await cartService.detail(cart_id);
  
  ctx.body = JSON.stringify(detailedCart, null, 1);
};