const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@getlookinggreat.hhjymrn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const run = async () => {
	try {
		const servicesCollection = client.db("gLGDb").collection("services");
        
        app.get('/services' , async(req ,res) =>{

            const query = {

            }
            const cursor = servicesCollection.find(query);
            const result = await cursor.toArray();
        res.send(result);
        })
        


	} finally {
	}
};
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("server is running");
});

app.listen(port, () => {
	console.log(`Server is running at ${port}`);
});
