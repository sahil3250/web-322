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
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  
    res.redirect('/about');
});

app.get('/about',(req,res)=>{
    
    res.sendFile(path.join(__dirname,'views','about.html'));
    
  });

  app.get('/blog',(req,res)=>{
    
 
      blog.getAllPosts().then(
        data => res.send((data)),
        error => res.status(404).send(`Error: ${error}`)
      );
  });
  app.get('/posts',(req,res)=>{
    
 
    blog.getPublishedPosts().then(
      data => res.send((data)),
      error =>res.status(404).send(`Error: ${error}`)
    );
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
