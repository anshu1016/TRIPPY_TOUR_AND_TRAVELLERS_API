const mongoose = require('mongoose');

const fs = require('fs');

const jsonData = fs.readFileSync('Destination.json', 'utf8');

const Destination = require("../models/destination.model.js")

const destinationsData = JSON.parse(jsonData);


async function seedDataBase(){
  try{
    console.log("FUNCTION CALLED")
    for(const destinationData of destinationsData ){
      const newDestination = new Destination({
        name:destinationData.name,
        description:destinationData.description,
        location:destinationData.location,
        rating:destinationData.rating,
        reviews:destinationData.reviews
      })
      await newDestination.save();
       console.log(`Destination "${newDestination.name}" seeded.`);
    }
    console.log('Database seeding complete.');
  }
  catch(error){
    console.log("Error in Seeding Database",error);
  }
  finally{
    mongoose.disconnect();
  }
}


//Create a new travel destination.
async function addNewDestination(destData) {
  try {
    const findInDBFirst = await Destination.findOne({ name: destData.name.toLowerCase() });

    if (findInDBFirst) {
      console.log("This place is already added in Database. Try Another Place");
    } else {
      const newDestination = new Destination(destData);
      await newDestination.save();
      console.log("New Destination Added.", newDestination);
      return newDestination;
    }
  } catch (error) {
    console.log("Error in Adding New Destination.", error);
    throw new Error("Failed to add new destination.");
  }
}


//Retrieve All travel destinations.

async function getDestination(){
  try{
    const getAllDest = await Destination.find({})
    if(!getAllDest){
      console.log("There is no destination data")
     
    }
    console.log("Data Fetched Succeesfully!")
    return getAllDest;
  }
  catch(error){
    console.log("Error in Fetching Destination Data.", error);
    throw new Error("Failed to Fetch destination data.");
  }
}


//Retrieve travel destination details by name.
const getDestinationByName = async (name) => {
    try {
      if(!name){
        console.log("Add the NAme properly")
      }
        const destination = await Destination.findOne({ name:new RegExp(`^${name}$`, 'i') });
      console.log("Destination found",destination)
        return destination;
    } catch (error) {
        console.error("Error fetching destination by name:", error);
        throw error; // This will be caught by the catch block in your route
    }
};


//Retrieve travel destinations by location (city or country).
async function getDestByLocation(destLocation){
  try{
    console.log(destLocation,"destLocation")
    if(!destLocation){
      console.log("Enter the location either city or address");
    } 
    const getDestByLoc = await Destination.findOne({location:new RegExp(`^${destLocation}$`,'i')})
    console.log("Location found Succesfully!",getDestByLoc);
    return getDestByLoc;
  }
  catch(error){
     console.log("Error fetching destination" , error);
        throw new error;
  }
}


//Retrieve travel destinations by their ratings (top-rated and low-rated).

async function getDestByDesc() {
  try {
    const sortDest = await Destination.find({}).sort({rating: -1});
    console.log("Destination Sorted BY Descending Order", sortDest);
    return sortDest;
  } catch (error) {
    console.log("Unable to Sort the Destination By Rating", error);
    throw new Error("Unable to Sort the Destination By Rating");
  }
}


//in Ascending ORder
async function getDestByAsc() {
  try {
    const sortDest = await Destination.find({}).sort({rating: 1});
    console.log("Destination Sorted BY Ascending Order", sortDest);
    return sortDest;
  } catch (error) {
    console.log("Unable to Sort the Destination By Rating", error);
    throw new Error("Unable to Sort the Destination By Rating");
  }
}

// Update a Travel Destination by ID#
async function updateTravelDestination(id, updatedData) {
    try {
        const updatedDestination = await Destination.findByIdAndUpdate(id, updatedData, { new: true }); 
        
        if (!updatedDestination) {
            throw new Error('Destination not found');
        }
      console.log("Destination Updated",updatedDestination)
        return updatedDestination;
    } catch (error) {
        console.error("Error updating destination:", error);
        throw error;
    }
}

//DELETE BY ID


async function deleteTravelDestination(id) {
    try {
        const destination = await Destination.findByIdAndDelete(id);

        if (!destination) {
            throw new Error('Destination not found');
        }

        return destination;
    } catch (error) {
        console.error("Error deleting destination:", error);
        throw error;
    }
}


//Filter BY Minimum Rating
async function filterDestinationsByMinRating(minRating) {
    try {
      console.log("minRating:",minRating)
        const destinations = await Destination.find({ rating: { $gte: minRating } }).exec();
        return destinations;
    } catch (error) {
        console.error("Error filtering destinations by minimum rating:", error);
        throw error;
    }
}



//Updating Travel Destination Model with User Ratings and Reviews
async function addReviewToDestination(destinationId, review) {
    try {
        const destination = await Destination.findById(destinationId);
        
        if (!destination) {
            throw new Error('Destination not found');
        }
        destination.reviews.push(review);
       

        await destination.save();

        return destination;
    } catch (error) {
        console.error("Error adding review to destination:", error);
        throw error;
    }
}

//GET FIRST THREE REVIEW
async function getFirstThreeReviews(destinationId) {
    try {
        const destination = await Destination.findById(destinationId).select('reviews').slice('reviews', 3).exec();
        if (!destination) {
            throw new Error('Destination not found');
        }
        return destination.reviews;
    } catch (error) {
        console.error("Error fetching the first three reviews:", error);
        throw error;
    }
}
































module.exports = {seedDataBase,addNewDestination,getDestination,getDestinationByName,getDestByLocation,getDestByDesc,getDestByAsc,updateTravelDestination,deleteTravelDestination,filterDestinationsByMinRating,addReviewToDestination,getFirstThreeReviews}