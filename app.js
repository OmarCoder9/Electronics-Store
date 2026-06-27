require("dotenv").config()
const express = require("express")
const app = express();
const cors = require("cors")
const userRouter = require("./routes/user.route")
const productRouter = require("./routes/product.route")
const DBconnect = require("./config/DBconnect")
const httpStatusText = require("./utils/httpStatusText")

DBconnect() 


app.use(cors())
app.use(express.json());

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)


// global middleware for not found router
app.use((req, res, next) => {
  return res
    .status(404)
    .json({
      status: httpStatusText.ERROR,
      message: "this resource is not available",
    });
});

// global error handler
app.use((error, req, res, next) => {
  res
    .status(error.statusCode || 500)
    .json({
      status: error.statusText || httpStatusText.ERROR,
      message: error.message,
      code: error.statusCode || 500,
      data: null,
    });
});


app.listen(process.env.PORT || 4000, ()=>{
    console.log("Listening to port", process.env.PORT);
    console.log(`running at http://localhost:${[process.env.PORT]}`);
})