const express = require("express");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const app = express();

// Middleware:
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jv1cd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    // console.log("db connected succesfully");
    const database = client.db("travel");
    const packageCollection = database.collection("packages");

    app.get("/packages", (req, res) => {
      packageCollection.find({}).toArray((error, documents) => {
        res.send(documents);
      });
    });
    app.get("/packages/:id", (req, res) => {
      packageCollection
        .find({ _id: ObjectId(req.params.id) })
        .toArray((error, documents) => {
          res.send(documents);
        });
    });

    app.post("/packages", (req, res) => {
      packageCollection.insertOne(req.body).then((result) => {
        res.send(result.insertedCount > 0);
      });
    });

    const orderCollection = client.db("travel").collection("orders");
    app.post("/order", (req, res) => {
      console.log(req.body);
      const orderData = req.body;
      orderCollection.insertOne(orderData).then((result) => {
        res.send(result.insertedCount > 0);
      });
    });

    app.get("/orders", (req, res) => {
      orderCollection.find(req.query).toArray((err, documents) => {
        res.send(documents);
      });
    });

    app.delete("/delete/:id", (req, res) => {
      orderCollection
        .findOneAndDelete({ _id: ObjectId(req.params.id) })
        .then((response) => {
          res.send(response.ok > 0);
        });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From My First Node");
});

app.listen(port, () => {
  console.log("listening to port", port);
});
