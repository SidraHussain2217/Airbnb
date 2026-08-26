const Listing = require("../models/listing");


module.exports.index =  async(req,res)=>{
  const alllistings = await  Listing.find({});
  res.render("listings/index.ejs",{alllistings});
};

module.exports.randerNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing =  async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
    path:"reviews",
    populate:{
        path: "author",
    },
})
   .populate("owner");
    if(!listing){
        req.flash("error","Listing Not Found!");
       return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
} ;


// module.exports.createListing = async(req,res, next)=>{
// let url =req.file.path;
// let filename = req.file.filename;
// console.log(url,"..",filename);
//  const newListing = new Listing(req.body.listing);

//  newListing.owner = req.user._id;
//  newListing.image = {url,filename};

// await newListing.save();
// req.flash("success","New Listing Created!");
// res.redirect("/listings");
// };

module.exports.createListing = async (req, res, next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        // Convert location into latitude and longitude
        const location = req.body.listing.location;

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
             {
                headers: {
                    "User-Agent": "WanderLust/1.0"
                }
            }
        );
 if (!response.ok) {
            throw new Error(
                `Nominatim API error: ${response.status} ${response.statusText}`
            );
        }
        const data = await response.json();

        if (data.length > 0) {
            newListing.geometry = {
                type: "Point",
                coordinates: [
                    Number(data[0].lon),
                    Number(data[0].lat)
                ]
            };
        }

        await newListing.save();

        req.flash("success", "New Listing Created!");
        res.redirect("/listings");

    } catch (error) {
        next(error);
    }
};
module.exports.renderEditForm = async(req, res)=>{
let {id} = req.params;
const listing = await Listing.findById(id);
 if(!listing){
        req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listings");
    }

let originalImageUrl = listing.image.url;
 originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
res.render("listings/edit.ejs",{listing , originalImageUrl});
};
// module.exports.updateListing = async(req,res)=>{
//     let {id} = req.params;
//     let listing =  await Listing.findByIdAndUpdate(id, {...req.body.listing},{new:true});
//     if(typeof req.file !== "undefined"){
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = {url, filename};
//     await listing.save();
//     }
//     req.flash("success","Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };
module.exports.updateListing = async (req, res, next) => {
    try {
        let { id } = req.params;

        let listing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { new: true }
        );

        // Update image if new image is uploaded
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;

            listing.image = { url, filename };

            await listing.save();
        }

        // Convert location into latitude and longitude
        const location = req.body.listing.location;

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
            {
                headers: {
                    "User-Agent": "WanderLust/1.0"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Nominatim API error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (data.length > 0) {
            listing.geometry = {
                type: "Point",
                coordinates: [
                    Number(data[0].lon),
                    Number(data[0].lat)
                ]
            };

            await listing.save();
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);

    } catch (error) {
        next(error);
    }
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
};