const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("server is running");
});
//DATABASE
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@cluster0.rhqv8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const run = async () => {
    try {
        await client.connect();
        const inventoriesCollection = client
            .db("Riders-warehouse")
            .collection("inventories");

        // get all inventories

        app.get("/inventories", async (req, res) => {
            const query = {};
            const cursor = inventoriesCollection.find(query);
            const inventories = await cursor.toArray();
            res.send(inventories);
        });
        console.log("mongodb connected");
    } catch (err) {
        console.log(err);
    } finally {
    }
};

run().catch(console.dir);

//
app.listen(port, (req, res) => {
    console.log("server is running at port", port);
});
