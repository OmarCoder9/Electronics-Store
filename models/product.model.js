const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);
module.exports = mongoose.model("Product", productSchema);