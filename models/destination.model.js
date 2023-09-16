const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name:{type:String,required:true},
  location:{type:String,required:true},
  description:{type:String,required:true},
  rating:{type:Number,min:0,max:10,default:0},
  reviews:[
    {
      user:{type:String,required:true},
      comment:{type:String,required:true}
    }
  ]
})
const Destination = mongoose.model("Destination",destinationSchema);
module.exports = Destination;