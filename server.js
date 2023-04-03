/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: sahilpreet singh Student ID: 166445213 Date: 24/03/2023
*
*  Online (Cyclic) Link: https://gold-walrus-sock.cyclic.app/about
*
********************************************************************************/ 
const express = require('express');
const authData = require('./auth-service');
const blogData = require("./blog-service");
const clientSessions = require('client-sessions');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require("express-handlebars");
const path = require("path");
const stripJs = require('strip-js');

const app = express();

app.use(express.urlencoded({extended: true}));

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: "dhobpx4ek",
    api_key: "742724157688558",
    api_secret: "WX4ZV2hlLAYbZpyWFc9MTVlC5Wo",
    secure: true
  });
const upload = multer();

app.use(clientSessions({
    cookieName: 'session',
    secret: 'your-secret-key',
    duration: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    activeDuration: 1000 * 60 * 5 // 5 minutes in milliseconds
  }));


  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });
  
  function ensureLogin(req, res, next) {
    if (!req.session.user.userName) {
      res.redirect("/login");
    } else {
      next();
    }
  }
  
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
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
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));

app.set('view engine', '.hbs');

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});


app.get('/login',(reg,res)=>
{
    res.render("login");

});
app.get('/register',(reg,res)=>
{
    res.render("register");

});

app.post('/register', (req, res) => {
    const userData = req.body;
    authData.registerUser(userData)
      .then(() => {
        res.render('register', { successMessage: 'User created' });
      })
      .catch((err) => {
        res.render('register', { errorMessage: err, userName: req.body.userName });
      });
  });


  app.post('/login', (req, res) => {
   
    const userData = req.body;
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(userData)
      .then((user) => {
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory,
        };
        res.redirect('/posts');
      })
      .catch((err) => {
        res.render('login', { errorMessage: err, userName: req.body.userName });
      });
  });


  app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
  });
  
  // User history route
  app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
  });
app.get('/', (req, res) => {
    res.redirect("/blog");
});

app.get('/about',(req, res) => {
    res.render("about");
});

app.get('/blog',async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
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
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/posts',ensureLogin, (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = blogData.getPostsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = blogData.getPostsByMinDate(req.query.minDate);
    } else {
        queryPromise = blogData.getAllPosts()
    }

    queryPromise.then(
        data => {
        if(data.length > 0)
        {
            console.log(data);
        res.render("posts", {posts: data});
        }
        else
        {

       res.render("posts",{ message: "no results" });

        }
    }).catch(err => {

        res.render("posts", {message: "no results"});
    })

});

app.post("/posts/add", upload.single("featureImage"), (req,res)=>{

    if(req.file){
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
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }

    function processPost(imageUrl){
        req.body.featureImage = imageUrl;

        blogData.addPost(req.body).then(post=>{
            res.redirect("/posts");
        }).catch(err=>{
            res.status(500).send(err);
        })
    }   
});

app.get('/posts/add',ensureLogin, (req, res) => {

     blogData.getCategories().then(

    data => 
    
    res.render("addPost", {categories: data})
     ).
     catch(  err=>
        {
            res.render("addPost", {categories: []})
        }
     );
});

app.get('/categories/delete/:id',ensureLogin, (req, res) => {
    const categoryId = req.params.id;
  
    try {
        blogData.deleteCategoryById(categoryId);
      res.redirect('/categories');
    } catch (error) {
      res.status(500).send('Unable to Remove Category / Category not found');
    }
  });

app.get('/post/:id',ensureLogin, (req,res)=>{
    blogData.getPostById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});

app.get('/posts/delete/:id',  (req, res) => {
    const postId = req.params.id;
 
    try {
        console.log(postId);
        blogData.deletePostById(postId).then(
        data=> res.redirect('/posts'),
       )
    } catch (error) {
      res.status(500).send('Unable to Remove Post / Post not found'); 
    }
  });

app.get('/blog/:id', ensureLogin,async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
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
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get('/categories',ensureLogin, (req, res) => {
    blogData.getCategories().then((data => {
        if(data.length > 0)
        {
           
            res.render("categories", {categories: data});

        }
        else
        {
          

       res.render("categories",{ message: "no results" });

        }
    })).catch(err => {
       

        res.render("categories", {message: "no results"});
    });
});





app.get('/categories/add',ensureLogin, (req, res) => {

    res.render("addCategory")



});






app.post('/categories/add',(req,res) =>
{

    if(req.file){
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
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }

    function processPost(imageUrl){
      

        blogData.addCategory(req.body).then(post=>{
            res.redirect("/categories");

        }).catch(err=>{
            res.status(500).send("could not add category");
        })
    }   
});


 

app.use((req, res) => {
    res.status(404).render("404");
})


blogData.initialize()
.then
(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
