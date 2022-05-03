const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const validateCreateOrder = async (ctx, next) => {
  const _ajv = new Ajv({ allErrors: true });
  addFormats(_ajv);
  const schema = {
    type: "object",
    required: ["cart_id", "paymentOptions"],
    properties: {
      cart_id: { type: "string", format: "uuid" },
      paymentOptions: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "amount"],
          properties: {
            id: { type: "string", format: "uuid" },
            amount: { type: "number" },
          },
        },
      },
    },
  };

  const validateSchema = _ajv.compile(schema);
  const isValid = await validateSchema(ctx.request.body);
  if (!isValid) {
    ctx.status = 400;
    ctx.body = {
      message: "Invalid Request",
      error: validateSchema.errors,
    };
    return;
  }
  return await next();
};

module.exports = {
  validateCreateOrder,
};
