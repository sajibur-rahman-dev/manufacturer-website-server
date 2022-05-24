/**
 * title : manufacturer website server :
 * descritpion : build server for  manufacturer website
 * author:Sajibur Rahman ( web developer);
 * date : 21 / 05 / 2022
 */

// depandancy :

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// configaration :

const port = process.env.PORT || 5000;

// app scaffolding :

const app = express();

// middleware :

app.use(cors());
app.use(express.json());

// connect to mongodb database :

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.vx0t0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// main functionality :

const run = async () => {
  try {
    await client.connect();

    const productCollection = client.db("manufacturer").collection("products");
    const orderCollection = client.db("manufacturer").collection("orders");
    const userCollection = client.db("manufacturer").collection("users");

    // products : api

    app.get("/products", async (req, res) => {
      const products = await productCollection.find().toArray();
      res.send(products);
    });

    // get indevidual product :

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // #####    #####
    // ##### user api  #####
    // #####    ######

    app.put("/users/:uid", async (req, res) => {
      const uid = req.params.uid;
      const user = req.body;
      const filter = { uid: uid };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      const token = jwt.sign({ uid: uid }, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1d",
      });
      res.send({result,token});
    });


    // #####    #####
    // ##### admin api  #####
    // #####    ######

    app.get('/admin/:uid',async(req,res)=>{
      const uid = req.params.uid;
      const query = {uid:uid};
      const user = await userCollection.findOne(query);
      const isAdmin = user.role === 'admin' || false;
      res.send({admin:isAdmin})
    })


    // #####    #####
    // ##### order detail #####
    // #####    ######

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await orderCollection.insertOne(orders);
      res.send(result);
    });
  } catch (err) {
    console.log(err);
  }
};

run();

// main api :

app.get("/", (req, res) => {
  res.send({ message: "app is running" });
});

// server running :

app.listen(port, () => {
  console.log(`server is running on port  ${port}`);
});
