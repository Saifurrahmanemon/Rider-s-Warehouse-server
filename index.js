const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());

//  jwt verification
function verifyJWT(req, res, next) {
    const getAuthHeader = req.headers.authorization;
    if (!getAuthHeader) {
        return res.status(401).send({ message: "unauthorize access" });
    }

    const getToken = getAuthHeader.split(" ")[1];
    jwt.verify(getToken, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res
                .status(403)
                .send("forbidden access!!😕 forbidden access");
        }
        console.log("decoded", decoded);
        res.decoded = decoded;
        next();
    });
}

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

        //FOR JWT AUTH
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "1d",
            });
            res.send({ accessToken });
        });

        // get all inventories
        app.get("/inventories", async (req, res) => {
            const query = {};
            const cursor = inventoriesCollection.find(query);
            const inventories = await cursor.toArray();
            res.send(inventories);
        });
        // for single inventory
        app.get("/inventories/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await inventoriesCollection.findOne(query);

            res.send(inventory);
        });
        //ADD NEW INVENTORY
        app.post("/addInventory", async (req, res) => {
            const newInventory = req.body;

            const result = await inventoriesCollection.insertOne(newInventory);
            res.send(result);
        });
        //DELETE A INVENTORY
        app.delete("/inventories/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoriesCollection.deleteOne(query);
            res.send(result);
        });
        // UPDATE QUANTITY
        app.put("/inventories/:id", async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $inc: {
                    quantity: updatedQuantity.updatedQuantityValue,
                },
            };
            const result = await inventoriesCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        //SEARCH BY EMAIL
        app.get("/myItems", verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            console.log(req.decoded);
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = inventoriesCollection.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
            } else {
                return res
                    .status(403)
                    .send("forbidden access!!😕 forbidden access");
            }
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
