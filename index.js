const express = require("express");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const budgetRoute=require("./routes/budgetRoute")
const transactionRoute=require("./routes/transactionRoute")
const { connectToDB } = require("./connectToDB");

const app = express();
const dbUrl = process.env.DB_URL;
app.use(express.json());
app.use(cors());
const port = 8080;

connectToDB(dbUrl);
app.listen(port, () => console.log("App running on localhost:8080"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/user", userRoute);

app.use("/budget",budgetRoute);

app.use("/transaction",transactionRoute)
