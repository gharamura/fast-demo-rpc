const db = require("../db.js");
const { v4: uuid } = require("uuid");

const clearOrder = async (ctx, next) => {
  const cartId = ctx.params.id;
  const orders = await db("orders").where({ cart_id: cartId });
  console.log('orders',orders)

  const clear = orders.map(async (order) => {
    await db("orders")
      .where({id: order.id})
      .update({
        cart_id: null,
        updated_at: new Date()
      })
    await db("traces")
      .insert({
        id: uuid(),
        user_id: order.user_id,
        cart_id: cartId,
        order_id: order.id,
        event: 'Order removed from cart',
        created_at: new Date()
      })
  })

  await Promise.all(clear)

  ctx.status = 200;
  ctx.body = {
    removedOrders: orders
  }

  return next();
}

module.exports = { 
  clearOrder
}
