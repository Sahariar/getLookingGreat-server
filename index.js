const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
		const reviewsCollection = client.db("gLGDb").collection("reviews");
		//get services
		app.get("/services", async (req, res) => {
			const query = {};
			const limit = parseInt(req.query.limit);
            const options = {
                // sort returned documents in ascending order by title (A->Z)
                sort: { postTime: -1 },
              };
			const cursor = servicesCollection.find(query , options);
			if (limit) {
				const result = await cursor.limit(limit).toArray();
				return res.send(result);
			}
			const result = await cursor.toArray();
			res.send(result);
		});
		app.get("/services/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await servicesCollection.findOne(query);
			res.send(result);
		});
        // post services
        app.post('/services' , async(req ,res) =>{
            const servicePost = req.body;
            const result = await servicesCollection.insertOne(servicePost)
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        })

        // delete services
        app.post('/services' , async(req ,res) =>{
            const id = req.body.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query)
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
              } else {
                console.log("No documents matched the query. Deleted 0 documents.");
              }
        })
		//get reviews
		app.get("/reviews", async (req, res) => {
			const service_id = req.query.service_id;
			const userEmail = req.query.email;

			let query = {};

			if (service_id) {
				query = {
					service_id: service_id,
				};
				
			}
			if (userEmail) {
				query = {
					userEmail: userEmail,
				};
			}
            const options = {
                // sort returned documents in ascending order by title (A->Z)
                sort: { postTime: -1 },
              };

			const cursor = reviewsCollection.find(query , options);
			const result = await cursor.toArray();
			res.send(result);
		});
        // post reviews
        app.post('/reviews' , async(req ,res) =>{
            const reviewPost = req.body;
            const result = await reviewsCollection.insertOne(reviewPost)
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        })
        
		app.get("/reviews/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await reviewsCollection.findOne(query);
			res.send(result);
		});
        // delete Reviews
        app.post('/reviews' , async(req ,res) =>{
            const id = req.body.id;
            const query = { _id: ObjectId(id) };

            const result = await reviewsCollection.deleteOne(query)

            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
              } else {
                console.log("No documents matched the query. Deleted 0 documents.");
              }
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
