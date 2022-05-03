const { v4: uuid } = require("uuid");

const take = (n, fn) => (new Array(Math.trunc(n)).fill(0)).map(_ => fn());
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const cartFactory = async (knex, user_id) => {

  const cart = {
    id: uuid(),
    user_id
  };

  const inventories = await knex("inventories");

  const parcels = take(1, () => randomElement(inventories)).map(inventory => ({
    id: uuid(),
    inventory_id: inventory.id,
    shipment_id: uuid()
  }))

  const cart_x_parcels = parcels.map(parcel => ({
    id: uuid(),
    parcel_id: parcel.id,
    cart_id: cart.id
  }))

  const randomParcelItemsFromInventory = async (parcel) => {
    const {inventory_id, id: parcel_id} = parcel;
    const inventory_balance = await knex("inventory_balances").where({inventory_id}).andWhere('balance', '>=', 6);

    return await Promise.all(take(5 * Math.random() + 1, () => randomElement(inventory_balance))
      .map(async inventory_balance => {

        const item_id = inventory_balance.item_id;
        const {product_id} = randomElement(await knex("product_x_items").where({item_id}));
        const {id: catalog_product_id} = randomElement(await knex("product_x_catalogs").where({product_id}));
        const quantity = 1 + Math.trunc(5 * Math.random());

        return {
          id: uuid(),
          parcel_id,
          item_id,
          catalog_product_id,
          quantity,
        }
      }))
  }

  const parcel_items = [];

  for(const parcel of parcels){
    const r = await randomParcelItemsFromInventory(parcel);
    parcel_items.push(...r);
  }

  const shipments = parcels.map(p => ({
    id: p.shipment_id,
    op_code: Math.random() > .2 ? "CARRIER" : "STORE_PICKUP",
    price: 150 * Math.random(),
    status_code: "QUOTE"
  }))

  return {
    cart,
    parcels,
    parcel_items,
    cart_x_parcels,
    shipments
  }
};

exports.seed = async function(knex) {

  await knex("parcel_x_items").del();
  await knex("cart_x_parcels").del();
  await knex("parcels").del();
  await knex("shipments").del();
  await knex("carts").del();

  const users = await knex("users").limit(50);

  for(const user of users){
    const {cart, parcels, parcel_items, shipments, cart_x_parcels} = await cartFactory(knex, user.id);

    await knex('carts').insert(cart);
    await knex('shipments').insert(shipments);
    await knex('parcels').insert(parcels);
    await knex('cart_x_parcels').insert(cart_x_parcels);
    await knex('parcel_x_items').insert(parcel_items);
  }

};
