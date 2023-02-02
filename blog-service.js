var posts;
var categories;
module.exports.initialize = ()=>
{
 return new Promise((resolve, reject) => {
  try{
    posts = require("./data/posts.json");
    categories = require("./data/categories.json");
    resolve();
  } catch(err) {
    
     reject("files could not be read");
  }
});

}
module.exports.getAllPosts = ()=> {


  return new Promise((resolve, reject) => {
    if(posts.length > 0) {
       resolve(posts); 
    } else {
      
       reject("no results returned");
    }
 });


  }


  module.exports.getPublishedPosts = ()=> {
    
      return new Promise((resolve, reject) => {
        if(posts.length > 0) {
        
        const post = posts.filter(posts => posts.published == true);
         
           resolve(post); 
        } else {
          
           reject("no results returned");
        }
     });
    
    
      }

      
  module.exports.getCategories = ()=> {
    
      return new Promise((resolve, reject) => {
        if(categories.length > 0) {
        
       
         
           resolve(categories); 
        } else {
          
           reject("no results returned");
        }
     });
    
    
      }