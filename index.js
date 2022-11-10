const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	

	if (!authHeader) {
		return res.status(401).send({ message: "Unauthorized Access" });
	}
	const token = authHeader.split(" ")[1];
	console.log(token);
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
		if (error) {
			return res.status(401).send({ message: "Unauthorized Access Token" });
		}
		req.decoded = decoded;
		next();
	});
}

const run = async () => {
	try {
		const servicesCollection = client.db("gLGDb").collection("services");
		const reviewsCollection = client.db("gLGDb").collection("reviews");
		// setUp JWT

		app.post("/jwt", (req, res) => {
			const user = req.body;
		
			const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
			res.send({ token });
		});

		//get services
		app.get("/services", async (req, res) => {
			let query = {};
			const limit = parseInt(req.query.limit);
			const name_id = req.query.nameId;
			const options = {
				// sort returned documents in ascending order by title (A->Z)
				sort: { postTime: -1 },
			};
			if (name_id) {
				query = { _id: ObjectId(name_id) };
				const result = await servicesCollection.findOne(query);
				return res.send(result);
			}

			const cursor = servicesCollection.find(query, options);
			if (limit) {
				const result = await cursor.limit(limit).toArray();
				return res.send(result);
			}

			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/services/single/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await servicesCollection.findOne(query);
			res.send(result);
		});
		app.get("/services/name", async (req, res) => {
			const id = req.query.id;
			const query = { _id: ObjectId(id) };
			const result = await servicesCollection.findOne(query);
			res.send(result);
		});
		// post services
		app.post("/services", async (req, res) => {

			const dataFrom = req.body;
			const reviewPost = {
				...dataFrom,
				postTime: new Date(),
			};

			const result = await servicesCollection.insertOne(reviewPost);
			console.log(`A document was inserted with the _id: ${result.insertedId}`);
			res.send(result)
		});
			

		// delete services
		app.delete("/services", async (req, res) => {
			const id = req.body.id;
			const query = { _id: ObjectId(id) };
			const result = await servicesCollection.deleteOne(query);
			if (result.deletedCount === 1) {
				console.log("Successfully deleted one document.");
			} else {
				console.log("No documents matched the query. Deleted 0 documents.");
			}
		});
		//get reviews
		app.get("/reviews", async (req, res) => {
			const service_id = req.query.service_id;
			let query = {};

			if (service_id) {
				query = {
					service_id: service_id,
				};
			}
		
			const options = {
				// sort returned documents in ascending order by title (A->Z)
				sort: { postTime: -1 },
			};

			const cursor = reviewsCollection.find(query, options);
			const result = await cursor.toArray();
			res.send(result);
		});
		//get reviews
		app.get("/reviews/user",verifyJWT, async (req, res) => {
			const userEmail = req.query.userEmail;

			

				const query = {
					userEmail: userEmail,
				};
		
			const options = {
				// sort returned documents in ascending order by title (A->Z)
				sort: { postTime: -1 },
			};

			const cursor = reviewsCollection.find(query, options);
			const result = await cursor.toArray();
			res.send(result);
		});

		// post reviews
		app.post("/reviews/single", verifyJWT, async (req, res) => {
			const dataFrom = req.body;
			const reviewPost = {
				...dataFrom,
				postTime: new Date(),
			};
			const result = await reviewsCollection.insertOne(reviewPost);
			console.log(`A document was inserted with the _id: ${result.insertedId}`);
			res.send(result)
		});

		// update reviews
		app.put("/reviews/single", verifyJWT, async (req, res) => {
		
			const id = req.query.id;
			const dataFrom = req.body;
			const reviewPost = {
				...dataFrom,
				postTime: new Date(),
			};
			const filter = { _id: ObjectId(id) };
			const updatedReview = {
				$set: {
					description: dataFrom.description,
					ratting: dataFrom.ratting,
					postTime: reviewPost.postTime,
				},
			};
		
			const options = { upsert: true };

			const result = await reviewsCollection.updateOne(
				filter,
				updatedReview,
				options
			);
			console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,);
			res.send(result);
		});

		app.get("/reviews/single", verifyJWT,  async (req, res) => {
			const id = req.query.id;
		
			const query = { _id: ObjectId(id) };
			const result = await reviewsCollection.findOne(query);
			res.send(result);
		});

		// delete Reviews
		app.delete("/reviews", verifyJWT, async (req, res) => {
			const id = req.query.id;
			const query = { _id: ObjectId(id) };

			const result = await reviewsCollection.deleteOne(query);

			if (result.deletedCount === 1) {
				console.log("Successfully deleted one document.");
			} else {
				console.log("No documents matched the query. Deleted 0 documents.");
			}
		});
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
