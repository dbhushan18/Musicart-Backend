const express = require("express");
const app = express();
const cors = require("cors")
const mongoose = require("mongoose");
const ItemsRoute = require("./Routes/items")
const AuthRoute = require("./Routes/auth")
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to the DB!!");
}).catch((err)=>{
    console.log("error connecting to the DB", err);
})

port = process.env.PORT || 4000;

app.get("/",(req,res)=>{
    res.json({message:"home route"});
})

app.get("/health", (req,res)=>{
    res.json({
        service: "Musicart",
        status: "Active",
        time: new Date(),
    })
})

app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/items", ItemsRoute);

app.listen(port,()=>{
    console.log(`App is connected to the port ${port}`)
})