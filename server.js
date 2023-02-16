/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: sahilpreet singh Student ID: 166445213 Date: 03/02/2023
*
*  Online (Cyclic) Link: https://gold-walrus-sock.cyclic.app/about
*
********************************************************************************/ 
var blog = require("./blog-service");
var express = require("express");
var path = require('path');
var app = express();

	const multer = require("multer");
  const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: "dhobpx4ek",
  api_key: "742724157688558",
  api_secret: "WX4ZV2hlLAYbZpyWFc9MTVlC5Wo",
  secure: true
});
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  
    res.redirect('/about');
});

app.get('/about',(req,res)=>{
    
    res.sendFile(path.join(__dirname,'views','about.html'));
    
  });

  app.get('/blog',(req,res)=>{
    
 
      blog.getPublishedPosts().then(
        data => res.send((data)),
        error => res.status(404).send(`Error: ${error}`)
      );
  });
  app.get('/posts',(req,res)=>{
    
 if(req.query.category)
 {
 
  blog. getPostsByCategory(req.query.category).then
  (
    data => res.send(data),
    error =>res.status(404).send(`Error: ${error}`)
  )

 }
 else if(req.query.minDate)
 {

  blog. getPostsByMinDate(req.query.minDate).then
  (
    data => res.send(data),
    error =>res.status(404).send(`Error: ${error}`)
  )
 }
 else if(req.query.id)
 {

  
  blog.getPostById(req.query.id).then(
    data => res.send((data)),
    error => res.status(404).send(`Error: ${error}`)
  );
 }
 else if(req.query.post)
 {

  blog.getAllPosts(req.query.minDate).then
  (
    data => res.send(data),
    error =>res.status(404).send(`Error: ${error}`)
  )
 }
 else
 {
  res.sendFile(path.join(__dirname,'views','post.html'));

    // blog.getAllPosts().then(
    //   data => res.send((data)),
    //   error =>res.status(404).send(`Error: ${error}`)
    // );
 }
});
app.get('/categories',(req,res)=>{
    blog.getCategories().then(
      data => res.send((data)),
      error => res.status(404).send(`Error: ${error}`)
    );
});
app.get('/posts/add',(req,res)=>{
  res.sendFile(path.join(__dirname,'views','addPost.html'));

});


app.get('/post/:id', (req, res) => {
  const { id } = req.params;
  blog.getPostById(id).then(
    data => res.send((data)),
    error => res.status(404).send(`Error: ${error}`)
  );
});

app.post("/posts/add", (req,res) => {
  
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
            }
        );

    });
};

async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
}

upload(req).then((uploaded)=>{
    req.body.featureImage = uploaded.url;

  blog.addPost(req.body).then(() =>
  {

    res.redirect("/posts");

  })
});
});



app.use((req, res, next) => {
    res.status(404).send({
    status: 404,
    error:'Not found'
    })
})


blog.initialize().then(()=>{
  app.listen(HTTP_PORT,() =>
  {
      console.log("Express http server listening on port " + HTTP_PORT);
  });

}).catch(()=>{
  console.log("error");
});
