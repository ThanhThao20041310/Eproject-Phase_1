const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Schema.Types.Mixed, // ✅ Cho phép cả ObjectId hoặc object { name, price }
        ref: "Product",
      },
    ],
    user: String,
    totalPrice: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "orders" }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
