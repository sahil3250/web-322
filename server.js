
var blog = require("./blog-service");
var express = require("express");
var path = require('path');
var app = express();
const HTTP_PORT = process.env.PORT || 8080;


app.get("/", (req, res) => {
  
    res.redirect('/about');
});

app.get('/about',(req,res)=>{
    try
    {
    res.sendFile(path.join(__dirname,'views','about.html'));
    }
    catch(err)
    {
        res.status(404).send(`Error: ${err}`);
    }
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

app.use((req, res, next) => {
    res.status(404).send({
    status: 404,
    error:'Not found'
    })
})



blog.initialize().then(
    data => app.listen(HTTP_PORT,() =>
    {
    
        console.log("Express http server listening on port " + HTTP_PORT);
    }),
    error => console.log(error)

  );