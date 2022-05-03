const db = require("../db.js");

function executeTransaction(type, currentStatus) {
  const responses = {
    SUCCESS: {
      status: "SUCCESS",
      code: "00",
      message: "successfully authorized transaction",
      retry: false,
    },
    FRAUD: {
      status: "REFUSED",
      code: "02",
      message: "Unauthorized transaction. Referred transaction",
      retry: false,
    },
    FAIL: {
      status: "REFUSED",
      code: "60",
      message: "Unauthorized transaction",
      retry: true,
    },
    EXCEEDED: {
      status: "REFUSED",
      code: "70",
      message: "Unauthorized transaction. Limit exceeded/no balance",
      retry: false,
    },
  };

  if (type === "WALLET") {
    return responses["SUCCESS"];
  }

  let rng = Math.floor(Math.random() * 101);
  console.log(`Status [${currentStatus}], RNG [${rng}]`);

  if (currentStatus === "PRE") {
    if (rng <= 70) {
      return responses["SUCCESS"];
    } else if (rng < 75) {
      return responses["FRAUD"];
    } else if (rng < 80) {
      return responses["EXCEEDED"];
    }
    return responses["FAIL"];
  } else {
    if (rng <= 90) {
      return responses["SUCCESS"];
    } else if (rng < 95) {
      return responses["FRAUD"];
    }
    return responses["EXCEEDED"];
  }
}

const executePayment = async (ctx, next) => {
  console.log('Called executePayment');
  const paymentId = ctx.params.id;

  const payment = await db("payments").where({ id: paymentId }).first();
  if (!payment) {
    ctx.status = 404;
    ctx.body = {
      message: `Payment ${paymentId} not found`,
    };
    return next();
  }

  if (payment.status_code === "SUCCESS") {
    ctx.status = 422;
    ctx.body = {
      message: `Payment ${paymentId} already processed`,
    };
    return next();
  }

  await db("payments").where({ id: paymentId }).update({
    status_code: "PROCESSING",
    updated_at: new Date(),
  });

  const result = executeTransaction(payment.op_code, payment.status_code);

  await db("payments").where({ id: paymentId }).update({
    status_code: result.status,
    external_status: result.code,
    external_response: result,
    updated_at: new Date(),
  });

  ctx.status = 200;
  ctx.body = {
    paymnetId: payment.id,
    message: result.message,
    code: result.code,
    retry: result.retry,
  };

  return next();
};

module.exports = {
  executePayment,
};
