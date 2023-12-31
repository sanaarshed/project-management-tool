const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { environment } = require("./config");
const cors = require("cors");
const Routers = require("./routes/index");
const app = express();

app.use(bodyParser.json());

// Same as bodyParser but built in
// app.use(express.json())
// app.use(express.urlencoded({extended:true}))

app.use(morgan("dev"));
app.use(cors({ origin: true }));

app.use(Routers);


app.use('*', (req, res) => {
  res.send('WELCOME TO SOO ZOO WATER PARK...😍😍😍')
})



app.get("/", (req, res) => {
  res.send("<h1>You're Connected </h1>");
});

// Catch unhandled requests such as wrong HTTP Method and forward to error handler.
app.use((req, res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.status = 404;
  err.errors = ["Could not find string of resource"];
  next(err);
});

// Generic error handler.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  const isProduction = environment === "production";
  res.json({
    title: err.title || "Server Error",
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

module.exports = app;
