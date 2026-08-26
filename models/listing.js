const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const listingSchema = new Schema({
    title: {
      type:  String,
      required: true
    },
    description: String,

    image: {
     url:String,
     filename:String,
       
    },

    
    //
    price:{
type:Number,
default:0
    },
    location: String,
    country: String,


    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        
    },
    coordinates: {
        type: [Number],
        
    },
    
},

    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review',
    },
],
owner:{
    type: Schema.Types.ObjectId,
    ref: 'User',
},
});

listingSchema.post("findOneAndDelete", async(listing) => {
    // console.log(listing);
    if(listing){
await Review.deleteMany({_id : {$in: listing.reviews}});
}
});



const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;