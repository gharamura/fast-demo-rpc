const db = require("../db.js");
const { v4: uuid } = require("uuid");

module.exports.create = async (ctx, next) => {
  const { cart_id, paymentOptions } = ctx.request.body;
  const { count: current_orders } = await db("orders").where({ cart_id }).count().first();

  console.log("currentOrders", current_orders);
  if (current_orders > 0) {
    ctx.status = 409;
    ctx.body = {
      message: `Cart_id ${cart_id} already has orders`,
    };
    return next();
  }

  const cart = await db("carts").where({ id: cart_id }).first();
  console.log("cart", cart);

  if (!cart) {
    ctx.status = 404;
    ctx.body = {
      message: `Cart_id ${cart_id} not found`,
    };
    return next();
  }

  const optionsIds = paymentOptions.map((item) => item.id);
  const _paymentOptions = await db("payment_options").whereIn("id", optionsIds);
  console.log("_paymentOptions", _paymentOptions);
  if (_paymentOptions.length !== paymentOptions.length) {
    ctx.status = 422;
    ctx.body = {
      message: `Payment option not found`,
    };
    return next();
  }

  const parcels = await db("cart_x_parcels")
    .innerJoin("parcels", "cart_x_parcels.parcel_id", "parcels.id")
    .where({ cart_id });

  const orders = await Promise.all(
    parcels.map(async (parcel) => {
      const parcel_items = await db("parcel_x_items")
        .innerJoin("items", "parcel_x_items.item_id", "items.id")
        .where({ parcel_id: parcel.id });

      const total_amount = parcel_items.reduce((acc, pi) => acc + pi.quantity * pi.price, 0);

      return {
        id: uuid(),
        user_id: cart.user_id,
        cart_id: cart.id,
        parcel_id: parcel.id,
        invoice_id: uuid(),
        total_amount,
        status_code: "CHECKING_OUT",
      };
    })
  );

  const invoices = orders.map((order) => ({
    id: order.invoice_id,
    user_id: cart.user_id,
    metadata: JSON.stringify(cart),
  }));

  const payments = paymentOptions.map((option) => {
    const currentOption = _paymentOptions.find(item => item.id === option.id);
    const aliasMap = {
      CASHBACK_WALLET: "WALLET",
      CREDIT_STRIPE: 'CREDIT'
    }

    return {
      id: uuid(),
      order_id: orders[0].id,
      invoice_id: invoices[0].id,
      option_id: option.id,
      amount: option.amount,
      status_code: "PRE",
      op_code: aliasMap[currentOption.alias]
    };
  });

  try {
    await db.transaction(async (trx) => {
      await trx("invoices").insert(invoices);
      await trx("orders").insert(orders);
      await trx("payments").insert(payments);
    });

    ctx.body = { orders, invoices, payments };
  } catch (e) {
    console.log(e);
  }
};
