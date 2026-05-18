require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const app = express();
const cors = require("cors")

const url = process.env.MONGO_URL;
mongoose.connect(url).then(()=>console.log("MongoDB Server Started"))


app.use(cors())
app.use(express.json());










app.listen(process.env.PORT || 4000, ()=>{
    console.log("Listening to port", process.env.PORT);
    console.log(`running at http://localhost:${[process.env.PORT]}`);
})