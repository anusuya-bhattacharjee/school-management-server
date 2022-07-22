const express = require("express");
const cors = require("cors");
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2uf9b.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
      if(err) {
        return res.status(403).send({ message: 'Forbidden access' });
      }
      req.decoded = decoded;
      next();
    })
  }

async function run() {
  try {
    await client.connect();
    const registeredUserCollection = client.db('SchoolManagement').collection('regisUsers');
    const StudentCollention = client
      .db("SchoolManagement")
      .collection("Student");
    console.log("db connected!!!!");

    app.post("/addStudentDetails", async (req, res) => { 
      const student = req.body;
      const query = { email_address: student.email_address };
      const options = { upsert: true };
      const updatedDoc = { 
        $set: {
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          address: student.address,
          pincode: student.pincode,
          phone: student.phone,
          image: student.image,
        },
      };
      const result = await StudentCollention.updateOne(query, updatedDoc, options);
      const res1 = await StudentCollention.findOne(query);
      res.send(res1);
    });

    app.get("/studentDetails/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email_address: email };
      const cursor = await StudentCollention.findOne(query);
      res.send(cursor);
    });

    app.get('/allProfiles', async (req, res) => {
      const query = {};
      const cursor = StudentCollention.find(query);
      const allProfiles = await cursor.toArray();
      res.send(allProfiles);
    })

    app.get('/student/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const dress = await StudentCollention.findOne(query);
      res.send(dress);
  })

  app.put('/updateStudent/:id', async(req, res) => {
    const id = req.params.id;
    const data = req.body;
    const query = {_id: ObjectId(id)};
    const options = {upsert: true};
    const updatedDoc = {
        $set: {
          studentId: data.studentId,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          pincode: data.pincode,
          phone: data.phone
        }
    };
    const result = await StudentCollention.updateOne(query, updatedDoc, options);
    const dress = await StudentCollention.findOne(query);
    res.send(dress);
})

    app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await registeredUserCollection.findOne({email: email});
        if (user.role) {
        if (user.role === "admin"){
          res.send({admin: true})
          console.log("admin")
        }
      }
        else {
          res.send({admin: false})
          console.log("student")
        }
        // const isAdmin = user.role === "admin";
        // res.send({admin: isAdmin})
    })

    app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true};
        const updatedDoc = {
          $set: user
        };
        const result = await registeredUserCollection.updateOne(filter, updatedDoc, options);
        const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'})
        res.send({result, token});
      })
  } 
  finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`School Management listening on port ${port}`);
});
