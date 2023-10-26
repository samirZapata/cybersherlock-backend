import mongoose from "mongoose";

export const con =  mongoose.connect("mongodb+srv://admin:BsGmmhgC_kK59wE@atlascluster.v91zgqv.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(db => console.log("DB is connected"))
.catch(err => console.log(err));

if(con){
    console.log("DB is connected");
}else{
    console.log("DB is not connected");
}