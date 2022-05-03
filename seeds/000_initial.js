const { v4: uuid } = require("uuid");
const { faker } = require('@faker-js/faker');

const take = (n, fn) => (new Array(Math.trunc(n)).fill(0)).map(_ => fn());
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const fakeUser = () => ({
  id: uuid(),
  name: faker.name.findName(),
  external_id: uuid()
})

const fakeProduct = () => ({
  id: uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription()
})

const fakeItem = () => ({
  id: uuid(),
  sku: faker.datatype.hexadecimal(10),
  price: faker.commerce.price()
})

const fakeInventory = () => ({
  id: uuid(),
  name: faker.address.city()
})

const fakeWalletTransaction = (wallet_id) => {

  const op_code = randomElement(["CREDIT", "DEBIT", "REFUND"]);
  const amount = 500 * Math.random() * (op_code === "DEBIT" ? -1 : 1);

  return {
    id: uuid(),
    wallet_id,
    op_code,
    amount
  }
}

const fakeInventoryTransaction = (inventory_id, item_id) => {

  const op_code = randomElement(['SALE', 'FILL', 'FOUND', 'LOST', 'CUSTOMER_RETURN', 'SHIPMENT_RETURN']);
  const quantity = Math.trunc(10 * (Math.random() +.1) * (['SALE', 'LOST'].includes(op_code) ? -1 : 10));

  return {
    id: uuid(),
    inventory_id,
    item_id,
    op_code,
    quantity
  }
}

const users = take(10, fakeUser);
const products = take(10, fakeProduct);
const items = take(10, fakeItem);
const product_x_items = products.map((p, i) => ({
  id: uuid(),
  product_id: p.id,
  item_id: items[i].id
}))

const inventories = take(2, fakeInventory);
const wallets = users.map(u => ({
  id: uuid(),
  user_id: u.id,
  active: Math.random() > .2
}))

const wallet_transactions = wallets
  .map(w => take(Math.random() * 10 + 1, () => fakeWalletTransaction(w.id)))
  .flat();

const inventory_transactions = inventories
.map(inv => items
  .map(item => take(Math.random() * 10 + 1, () => fakeInventoryTransaction(inv.id, item.id)))
  .flat())
.flat()

const catalogs = [
  {
    id: uuid(),
    name: "PUBLIC_DEFAULT"
  },

  {
    id: uuid(),
    name: "PARTNERS",
    claim: "PARTNER"
  }
];

const product_x_catalogs = products.map(p => ({
  id: uuid(),
  product_id: p.id,
  catalog_id: Math.random() > .2 ? catalogs[0].id : catalogs[1].id 
}));

const payment_options = wallets.filter(w => w.active).map(w => ({
  id: uuid(),
  user_id: w.user_id,
  alias: "CASHBACK_WALLET",
  external_token: w.id,
  external_provider_code: '2020'
}));

payment_options.push(...users.map(u => ({
    id: uuid(),
    user_id: u.id,
    alias: "CREDIT_STRIPE",
    external_token: faker.datatype.hexadecimal(24),
    external_provider_code: randomElement(['231', '721', '1122']),
})));



exports.seed = async function(knex) {

  await knex("traces").del();
  await knex("payments").del();
  await knex("orders").del();
  await knex("invoices").del();
  await knex("cart_x_parcels").del();
  await knex("carts").del();
  await knex("parcel_x_items").del();
  await knex("parcels").del();
  await knex("shipments").del();
  await knex("item_x_medias").del();
  await knex("medias").del();
  await knex("product_x_catalogs").del();
  await knex("catalogs").del();
  await knex("product_x_items").del();
  await knex("wallet_transactions").del();
  await knex("wallets").del();
  await knex("inventory_transactions").del();
  await knex("inventories").del();  
  await knex("items").del();
  await knex("products").del();
  await knex("payment_options").del();
  await knex('users').del();

  await knex('users').insert(users);
  await knex('products').insert(products);
  await knex('items').insert(items);
  await knex('product_x_items').insert(product_x_items);
  await knex('inventories').insert(inventories);
  await knex('wallets').insert(wallets);
  await knex('wallet_transactions').insert(wallet_transactions);
  await knex('inventory_transactions').insert(inventory_transactions);
  await knex('catalogs').insert(catalogs);
  await knex('product_x_catalogs').insert(product_x_catalogs);
  await knex('payment_options').insert(payment_options);

};
