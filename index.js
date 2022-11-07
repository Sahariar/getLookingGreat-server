const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 4000
 
// middleware
app.use(cors());
app.use(express.json());
 
const run = async () => {
}
run().catch(console.dir); 
 
 
app.get('/' , (req ,res) =>{
res.send('server is running');
})
 
app.listen(port, ()=>{
console.log(`Server is running at ${port}`);
})
