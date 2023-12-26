const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
app.use(express.json())
app.use(cors())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    
    const database = client.db("Task")
    const tasksCollection = database.collection("tasks")

    //create a new task
    app.post('/api/tasks', async (req, res) => {
      try {
        const result = await tasksCollection.insertOne(req.body);
        res.send(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    //get all tasks
    app.get('/api/tasks', async (req, res) => {
      try {
        const tasks = await tasksCollection.find().toArray();
        res.json(tasks);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // specific task by ID
    app.get('/api/tasks/:Id', async (req, res) => {
      try {
        const task = await tasksCollection.findOne({ _id: new ObjectId(req.params.Id) });
        if (!task) {
          return res.status(404).json({ message: 'not found' });
        }
        res.json(task);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    //update a task by ID
    app.put('/api/tasks/:Id', async (req, res) => {
      try {
        const newData = { $set: req.body };
        const updatedTask = await tasksCollection.findOneAndUpdate(
          { _id: new ObjectId(req.params.Id) },
          newData,
          { returnOriginal: false }
        );
        if (!updatedTask.value) {
          return res.status(404).json({ message: 'not found' });
        }
        res.json(updatedTask.value);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    //delete a task by ID
    app.delete('/api/tasks/:kId', async (req, res) => {
      try {
        const result = await tasksCollection.findOneAndDelete({ _id: new ObjectId(req.params.Id) });
        if (!result.value) {
          return res.status(404).json({ message: 'not found' });
        }
        res.send(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})