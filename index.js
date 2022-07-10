const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

async function run() {
  try {
    await client.connect();
    // const RegisterUserCollection = client.db('SchoolManagement').collection('RegisterUsers');
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
          fristName: student.firstName,
          lastName: student.lastName,
          address: student.address,
          pincode: student.pincode,
          phone: student.phone,
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
