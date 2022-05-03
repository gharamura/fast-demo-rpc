const db = require("../db.js");

module.exports.detail = async (cart_id) => {
	const cart = await db("carts").where({id: cart_id}).first();

	const parcels = await db("cart_x_parcels")
		.innerJoin('parcels', 'cart_x_parcels.parcel_id', 'parcels.id')
		.where({cart_id});

	for (const p of parcels){
		p.items  = await db("parcel_x_items")
			.innerJoin("items", "parcel_x_items.item_id", "items.id")
			.leftJoin("product_x_catalogs", "parcel_x_items.catalog_product_id", "product_x_catalogs.id")
			.leftJoin("products", "product_x_catalogs.product_id", "products.id")
			.where({parcel_id: p.parcel_id});

		for (const item of p.items){
			item.medias = await db("item_x_medias")
				.innerJoin("medias", "item_x_medias.media_id", "medias.id")
		  		.where("item_x_medias.item_id", item.item_id);
		}

		p.shipment = await db("shipments").where({id: p.shipment_id}).first();

		return {cart, parcels}
	}	
}