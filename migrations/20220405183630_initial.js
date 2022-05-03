const { onUpdateTrigger } = require("../knexfile");

exports.up = async function (knex) {
  await knex.schema.createTable("users", function (table) {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("external_id");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("products", function (table) {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.text("description");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("items", function (table) {
    table.uuid("id").primary();
    table.string("sku").notNullable();
    table.decimal("price", 12, 4);
    table.string("attr_name");
    table.string("attr_value");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("inventories", function (table) {
    table.uuid("id").primary();
    table.string("name").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("inventory_transactions", function (table) {
    table.uuid("id").primary();
    table.uuid("inventory_id").references("inventories.id").notNullable();
    table.uuid("item_id").references("items.id").notNullable();
    table.integer("quantity").notNullable();
    table.enu("op_code", ["SALE", "FILL", "FOUND", "LOST", "CUSTOMER_RETURN", "SHIPMENT_RETURN"]);
    table.json("metadata");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("wallets", function (table) {
    table.uuid("id").primary();
    table.uuid("user_id").references("users.id").notNullable();
    table.boolean("active").default(true).notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("wallet_transactions", function (table) {
    table.uuid("id").primary();
    table.uuid("wallet_id").references("wallets.id").notNullable();
    table.decimal("amount", 12, 4).notNullable();
    table.enu("op_code", ["CREDIT", "DEBIT", "REFUND"]).notNullable();
    table.json("metadata");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("product_x_items", function (table) {
    table.uuid("id").primary();
    table.uuid("product_id").references("products.id").notNullable();
    table.uuid("item_id").references("items.id").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("catalogs", function (table) {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("claim");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("product_x_catalogs", function (table) {
    table.uuid("id").primary();
    table.uuid("product_id").references("products.id").notNullable();
    table.uuid("catalog_id").references("catalogs.id").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("medias", function (table) {
    table.uuid("id").primary();
    table.text("url").notNullable();
    table.enu("kind", ["IMAGE", "VIDEO"]).notNullable();
    table.json("metadata");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("item_x_medias", function (table) {
    table.uuid("id").primary();
    table.uuid("item_id").references("items.id").notNullable();
    table.uuid("media_id").references("medias.id").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("shipments", function (table) {
    table.uuid("id").primary();
    table.enu("op_code", ["STORE_PICKUP", "CARRIER"]).notNullable();
    table.decimal("price", 12, 4).notNullable();
    table.json("metadata");
    table.string("external_status");
    table.json("external_response");
    table
      .enu("status_code", [
        "QUOTE",
        "WAITING",
        "READY-FOR-PICKUP",
        "TRANSIT",
        "DELIVERED",
        "DELIVERY-FAILED",
        "RETURN-TRANSIT",
        "RETURNED",
      ])
      .notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("parcels", function (table) {
    table.uuid("id").primary();
    table.uuid("shipment_id").references("shipments.id");
    table.uuid("inventory_id").references("inventories.id").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("parcel_x_items", function (table) {
    table.uuid("id").primary();
    table.uuid("parcel_id").references("parcels.id").notNullable();
    table.uuid("item_id").references("items.id").notNullable();
    table.uuid("catalog_product_id").references("product_x_catalogs.id").notNullable();
    table.integer("quantity").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("carts", function (table) {
    table.uuid("id").primary();
    table.uuid("user_id").references("users.id").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("cart_x_parcels", function (table) {
    table.uuid("id").primary();
    table.uuid("parcel_id").references("parcels.id").notNullable();
    table.uuid("cart_id").references("carts.id").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("invoices", function (table) {
    table.uuid("id").primary();
    table.uuid("user_id").references("users.id").notNullable();
    table.json("metadata");

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("orders", function (table) {
    table.uuid("id").primary();
    table.uuid("user_id").references("users.id").notNullable();
    table.uuid("cart_id").references("carts.id").notNullable();
    table.uuid("parcel_id").references("parcels.id").notNullable();
    table.uuid("invoice_id").references("invoices.id");
    table.decimal("total_amount", 12, 4).notNullable();
    table.string("status_code").notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("payments", function (table) {
    table.uuid("id").primary();
    table.uuid("order_id").references("orders.id").notNullable();
    table.enu("op_code", ["WALLET", "CREDIT", "BNPL"]).notNullable();
    table.decimal("amount", 12, 4).notNullable();
    table.json("metadata");

    table.string("external_status");
    table.json("external_response");
    table.enu("status_code", ["PRE", "PROCESSING", "SUCCESS", "REFUSED", "PROCESSING_FAILED"]).notNullable();

    table.timestamps(true, true);
    table.index("created_at");
    table.index("updated_at");
  });

  await knex.schema.createTable("traces", function (table) {
    table.uuid("id").primary();
    table.uuid("user_id").index();
    table.uuid("cart_id").index();
    table.uuid("order_id").index();
    table.uuid("invoice_id").index();
    table.uuid("parcel_id").index();
    table.uuid("shipment_id").index();
    table.uuid("inventory_id").index();
    table.uuid("item_id").index();
    table.boolean("public").default(false).notNullable();
    table.string("event").notNullable();
    table.json("metadata");
  });

  await knex.schema.createTable("payment_options", function (table) {
    table.uuid("id").primary();
    table.string("user_id").notNullable().index();
    table.string("alias").notNullable();
    table.string("external_token").notNullable();
    table.string("external_provider_code").notNullable();
  });

  await knex.schema.raw(`
        CREATE VIEW wallet_balances AS
        SELECT wallet_id, sum(amount) as balance 
            FROM wallet_transactions GROUP BY wallet_id;
    `);

  await knex.schema.raw(`
        CREATE VIEW inventory_balances AS
        SELECT inventory_id, item_id, sum(quantity) as balance 
            FROM inventory_transactions GROUP BY inventory_id, item_id;
    `);

  await knex.raw(onUpdateTrigger("users"));
  await knex.raw(onUpdateTrigger("traces"));
  await knex.raw(onUpdateTrigger("payments"));
  await knex.raw(onUpdateTrigger("orders"));
  await knex.raw(onUpdateTrigger("invoices"));
  await knex.raw(onUpdateTrigger("cart_x_parcels"));
  await knex.raw(onUpdateTrigger("carts"));
  await knex.raw(onUpdateTrigger("parcel_x_items"));
  await knex.raw(onUpdateTrigger("parcels"));
  await knex.raw(onUpdateTrigger("shipments"));
  await knex.raw(onUpdateTrigger("item_x_medias"));
  await knex.raw(onUpdateTrigger("medias"));
  await knex.raw(onUpdateTrigger("product_x_catalogs"));
  await knex.raw(onUpdateTrigger("catalogs"));
  await knex.raw(onUpdateTrigger("product_x_items"));
  await knex.raw(onUpdateTrigger("wallet_transactions"));
  await knex.raw(onUpdateTrigger("wallets"));
  await knex.raw(onUpdateTrigger("inventory_transactions"));
  await knex.raw(onUpdateTrigger("inventories"));
  await knex.raw(onUpdateTrigger("items"));
  await knex.raw(onUpdateTrigger("products"));
  await knex.raw(onUpdateTrigger("payment_options"));
};

exports.down = async function (knex) {
  await knex.schema.dropView("wallet_balances");
  await knex.schema.dropView("inventory_balances");
  await knex.schema.dropTable("traces");
  await knex.schema.dropTable("payments");
  await knex.schema.dropTable("orders");
  await knex.schema.dropTable("invoices");
  await knex.schema.dropTable("cart_x_parcels");
  await knex.schema.dropTable("carts");
  await knex.schema.dropTable("parcel_x_items");
  await knex.schema.dropTable("parcels");
  await knex.schema.dropTable("shipments");
  await knex.schema.dropTable("item_x_medias");
  await knex.schema.dropTable("medias");
  await knex.schema.dropTable("product_x_catalogs");
  await knex.schema.dropTable("catalogs");
  await knex.schema.dropTable("product_x_items");
  await knex.schema.dropTable("wallet_transactions");
  await knex.schema.dropTable("wallets");
  await knex.schema.dropTable("inventory_transactions");
  await knex.schema.dropTable("inventories");
  await knex.schema.dropTable("items");
  await knex.schema.dropTable("products");
  await knex.schema.dropTable("payment_options");
  await knex.schema.dropTable("users");
};
