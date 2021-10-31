const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7e2ha.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("tour_services");
        console.log('connected');
        const serviceCollection = database.collection("services");
        // console.log(db.products);
        // const orderCollection = database.collection("myOrders");
        const myOrderCollection = database.collection("myOrders");

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        //GET SINGLE SERVICE
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        });
        //add Order API
        app.post('/myOrders', async (req, res) => {
            const id = req.params.id;
            const order = req.body;
            const result = await myOrderCollection.insertOne(order);
            console.log(result)
            res.json(result);
        });
        //Get Order API
        app.get('/myOrders', async (req, res) => {
            const cursor = myOrderCollection.find({});
            const myOrders = await cursor.toArray();
            res.send(myOrders);
        });
        // delete order API
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myOrderCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        })

        // Add new a service
        app.post('/services', async (req, res) => {
            // console.log('hit the post');
            // res.send('post hitted')
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        });
        //Put order status
        app.put('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const upadatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
              $set: {
                status:'Approved'
              },
            };
            const order = await myOrderCollection.updateOne(filter, updateDoc, options);
            res.json(order);
          })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running in browser')
})

app.listen(port, () => {
    console.log('listenini to', port);
})