import {v2 as cloudinary} from 'cloudinary'
import { app } from "./app";
import { connectDb } from "./utils/db";
require('dotenv').config()

// cloudinary config
cloudinary.config({
 cloud_name: process.env.CLOUD_NAME,
 api_key: process.env.CLOUD_KEY,
 api_secret: process.env.CLOUD_SECRET,
});


// connect to server 
 app.listen(process.env.PORT, () => {
    console.log('server started on ', process.env.PORT);

    // connect database 
    connectDb();
})

