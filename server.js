/*********************************************************************************
*  WEB322 – Assignment 03
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
var app = express();
var stripJs = require('strip-js');



var path = require('path');
var exphbs = require('express-handlebars');

app.engine(".hbs", exphbs.engine({    defaultLayout: 'main', extname: ".hbs" ,helpers:{
  	navLink: function(url, options){
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
}
,
equal: function (lvalue, rvalue, options) {
  if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
},	
safeHTML: function(context){
  return stripJs(context);
}


}}));
app.set("view engine", ".hbs");



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
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  
    res.redirect('/blog');
});

app.get('/about',(req,res)=>{
  const data = {
    title: 'Home',
    message: 'Welcome to my website!'
  };
    res.render(path.join(__dirname,'views','about.hbs'),data);
    
  });
 

  app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});
app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blog.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blog.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blog.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blog.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
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
  blog.getAllPosts().then
  (
    data => res.render(path.join(__dirname,'views','posts.hbs'),{posts: data}),
    error =>res.status(404).send(`Error: ${error}`)
  )
  

    // blog.getAllPosts().then(
    //   data => res.send((data)),
    //   error =>res.status(404).send(`Error: ${error}`)
    // );
 }
});
app.get('/categories',(req,res)=>{
    blog.getCategories().then(
      data => res.render(path.join(__dirname,'views','categories.hbs'),{category: data}),
      error => res.render("categories", {message: error})
    );
});
app.get('/posts/add',(req,res)=>{
  res.render(path.join(__dirname,'views','addPost.hbs'));

});


app.get('/post/:id', (req, res) => {
  const { id } = req.params;
  blog.getPostById(id).then(
    data => res.send((data)),
    error => res.status(404).send(`Error: ${error}`)
  );
});

app.post("/posts/add", upload.single("featureImage"),(req,res) => {
  
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
        streamifier.createReadStream(req.file.buffer).pipe(stream);
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
