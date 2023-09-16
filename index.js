const express= require("express");

const app= express();

const PORT = 3000;

const {initializeDatabase} = require("./db/db.js");

const{
  seedDataBase,
addNewDestination,getDestination,getDestinationByName,getDestByLocation,getDestByDesc,getDestByAsc,updateTravelDestination,deleteTravelDestination,filterDestinationsByMinRating,addReviewToDestination,getFirstThreeReviews
} = require("./queries/tour.queries.js")

app.get("/",(req,res)=>{
  res.send("Hello Express App!")
})

app.listen(PORT,()=>{
  console.log(`server started at ${PORT}`)
})

app.use(express.json());

initializeDatabase();

//Adding Data in MONGODB DATABASE
// seedDataBase();


//Create a new travel destination.
const destData = {
  name:"Lal Qila",
  location:"Delhi",
  description:"Nice Place",
  rating:6,
  reviews:[{user:"Ankit Bank",comment:"Historical Ocssss"}]
}
// addNewDestination(destData)

app.post("/addNewDestination",async(req,res)=>{
  try{
    const newDestData = req.body;
    const addToDB = await addNewDestination(newDestData);
    res.status(201).json({status:"Success",message:"New Destination Added Succesfully.",newDestination:addToDB})
  }
  catch(error){
    console.log("Unable to add new Destination",error)
    res.status(501).json({status:"Error",message:"Unable to add new Destination",details:error.message})
  }
})


//Retrieve All destination details 
app.get("/destinations",async(req,res)=>{
  try{
     const getAllDest = await getDestination();
    if(!getAllDest){
      console.log("There is no destination data")
      res.status(404).json({message:"There is no destination data"})}
      res.status(201).json({message:"Data fetched Successfully",data:getAllDest})
  }
  catch(error){
     console.log("Unable to fetch Destination",error)
    res.status(501).json({status:"Error",message:"Unable to fetch Destination",details:error.message})
  }
})


//Retrieve travel destination details by name.
app.get("/destination/:destinationName", async (req, res) => {
    try {
      
        const desName = req.params.destinationName;
        console.log(desName,"desName")
        if (desName) {
            const getDestByName = await getDestByLocation(desName.toLowerCase());

            if (getDestByName) {
                res.status(200).json({ message: "Success", data: getDestByName });
            } else {
                res.status(404).json({ message: "Destination not found." });
            }
        } else {
            res.status(400).json({ message: "Invalid destination name format." });
        }
    } catch (error) {
        console.log("Unable to fetch Destination By Name", error);
        res.status(500).json({ status: "Error", message: "Unable to fetch Destination By Name", details: error.message });
    }
});

//Reterive destination BY location

app.get("/destination/:destLocation",async(req,res)=>{
  try{
    const destLoc = req.params.destLocation;
     console.log(destLoc,"destLoc")
        if (destLoc) {
            const getDestByLoc = await getDestByLocation(destLoc.toLowerCase());

            if (getDestByLoc) {
                res.status(200).json({ message: "Success", data: getDestByLoc });
            } else {
                res.status(404).json({ message: "Destination not found." });
            }
        } else {
            res.status(400).json({ message: "Invalid destination location format." });
        }
  }
  catch(error){
    console.log("Unable to fetch Destination By this location", error);
        res.status(500).json({ status: "Error", message: "Unable to fetch Destination By this location", details: error.message });
  }
})


//Retrieve travel destinations by their ratings (top-rated and low-rated).
app.get("/destination/sort/desc", async (req, res) => {
  try {
    const sortDest = await getDestByDesc();
    if (sortDest.length === 0) {
      res.status(404).json({message: "No destinations found."});
      return;
    }
    res.status(200).json({message: "Success! Destination Sorted in Descending Order", data: sortDest});
  } catch (error) {
    console.log("Unable to sort Destination By Descending Order", error);
    res.status(500).json({ status: "Error", message: "Unable to sort Destination By Descending Order", details: error.message });
  }
});



//By Ascending Order
app.get("/destination/sort/asc", async (req, res) => {
  try {
    const sortDest = await getDestByAsc();
    if (sortDest.length === 0) {
      res.status(404).json({message: "No destinations found."});
      return;
    }
    res.status(200).json({message: "Success! Destination Sorted in Ascending Order", data: sortDest});
  } catch (error) {
    console.log("Unable to sort Destination By Ascending Order", error);
    res.status(500).json({ status: "Error", message: "Unable to sort Destination By Ascending Order", details: error.message });
  }
});

// Update a Travel Destination by ID#
app.post('/destination/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const updatedDestination = await updateTravelDestination(id, updatedData);
        
        res.status(200).json({
            status: "Success",
            message: "Destination updated successfully",
            data: updatedDestination
        });
    } catch (error) {
        console.error("Error updating destination by ID:", error);
        res.status(500).json({
            status: "Error",
            message: "Unable to update destination",
            details: error.message
        });
    }
});


//Delete a Travel Destination by ID
app.post("/destination/delete/:destId", async (req, res) => {
    try {
        const destID = req.params.destId;

        const deletedDestination = await deleteTravelDestination(destID);

        if (!deletedDestination) {
            return res.status(404).json({
                status: "Error",
                message: "Destination not found"
            });
        }

        res.status(200).json({
            status: "Success",
            message: "Destination deleted successfully",
            data: deletedDestination
        });
    } catch (error) {
        console.error("Error deleting destination by ID:", error);
        res.status(500).json({
            status: "Error",
            message: "Unable to delete destination",
            details: error.message
        });
    }
});


//FIlter by MInIMum Rating
app.get('/destination/filter/:rating', async (req, res) => {
    try {
        const minRating = parseFloat(req.query.rating) || 0; 
console.log("minRating",minRating)
        const destinations = await filterDestinationsByMinRating(minRating);
        
        res.status(200).json({
            status: "Success",
            message: `Destinations with rating greater than or equal to ${minRating}`,
            data: destinations
        });
    } catch (error) {
        console.error("Error fetching destinations by minimum rating:", error);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch destinations by minimum rating",
            details: error.message
        });
    }
});


//Updating Travel Destination Model with User Ratings and Reviews
app.post('/destination/:id/review', async (req, res) => {
    try {
        const destinationId = req.params.id;
        const review = req.body; 
        if (!review.user || !review.comment) {
            return res.status(400).json({
                status: "Error",
                message: "Incomplete review data. Ensure you provide user, comment, and rating."
            });
        }

        const updatedDestination = await addReviewToDestination(destinationId, review);
        
        res.status(200).json({
            status: "Success",
            message: "Review added successfully",
            data: updatedDestination
        });
    } catch (error) {
        console.error("Error adding review to destination:", error);
        res.status(500).json({
            status: "Error",
            message: "Failed to add review",
            details: error.message
        });
    }
});


//GET FIRST THREE REVIEWS
app.get('/destination/:id/review/getThreereviews', async (req, res) => {
    try {
        const destinationId = req.params.id;
        
        const reviews = await getFirstThreeReviews(destinationId);
        
        res.status(200).json({
            status: "Success",
            data: reviews
        });
    } catch (error) {
        console.error("Error fetching the first three reviews:", error);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch the first three reviews",
            details: error.message
        });
    }
});