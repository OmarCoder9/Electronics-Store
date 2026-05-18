const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type:String,
        requied: true
    },
    price:{
        type:Number,
        required: true
    },
    raiting:{
        type:Number
    },
    category:{
        type:String,
        requied:true
    }

})
module.exports = mongoose.model("Product", productSchema)