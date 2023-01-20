const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


const port = process.env.PORT || 5000;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7czv3fq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const appointmentOptionCollection=client.db('healthcare').collection('appointmentOptions');
        const bookingsCollection=client.db('healthcare').collection('bookings');

        const usersCollection = client.db("healthcare").collection("users");
        
    
        
        app.post("/users", async (req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.send(result);
        });

        app.get('/appointmentOptions', async(req,res) =>{
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();
            res.send(options);
          })

          app.post('/bookings', async(req,res) =>{
            const booking = req.body;
            const query = {
             appointmentDate: booking.appointmentDate,
             email: booking.email,
             treatment: booking.treatment
            }
            const alreadyBooked = await bookingsCollection.find(query).toArray();
    
            if(alreadyBooked.length){
                const message = `You already have a booking on ${booking.appointmentDate}. Choose new date.`;
                return res.send({acknowledged:false, message})
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
           });
   
           app.get('/bookings', async(req,res) =>{
            const email = req.query.email;
            const query = { email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings)
          });


          app.get('/users/admin/:email', async(req,res) =>{
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
          })
        //    app.get('/bookings/:email',(req,res) =>{
        //     console.log(req)
        //     const email = req.params.email;
        //     console.log(email)
        //     const bookings = bookingsCollection.find(booking=>booking.email===email)
        //     res.send(bookings)
        //   });

        //   app.get('/checkouts/:id', (req, res) => {
        //     const id = req.params.id;
        //     const checkoutCourse = checkouts.find(c => c.id === id);
        //      res.send(checkoutCourse);
        //  });
    }
    finally{

    }
}
run().catch(console.log)

app.get('/', async(req,res) =>{
    res.send('HealthCare is running on server')
   })
   
app.listen(port, ()=> console.log(`Healthcare is running on: ${port}`))
