
module.exports.initialize = ()=>
{

   return new Promise((resolve,reject)=>{
      fs.readFile('./data/posts.json', 'utf8', (err, data) => {
          if (err){
              reject("unable to read file");
          }
          else{
              posts=JSON.parse(data);
          
         
          fs.readFile('./data/categories.json', 'utf8', (err, data) => {
              if (err){
                  reject("unable to read file");
              }
              else{

              categories=JSON.parse(data);
              resolve();
              }
          });
      }
      });
      

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


      module.exports.addPost = (postData)=>
      {
         postData.published==undefined ? postData.published = false : postData.published = true;
    postData.id = posts.length + 1;
    posts.push(postData);

    return new Promise((resolve,reject) => {
        if (postData.length == 0) {
            reject ('no results');
        }
        else 
        {
            resolve(postData);
        }
    })
        
      }


      module.exports.getPostsByCategory = (category) =>
      {
        return new Promise((resolve,reject) => {
            var found = posts.filter(posts => posts.category == category);
            if (found.length == 0) {
                reject('no results');
            }
            resolve(found);


        })
      }

      module.exports.getPostsByMinDate = (date) =>
      {
         return new Promise((resolve,reject) =>
         {
            var found = posts.filter(posts => posts.postDate >= date);
            if (found.length == 0) {
                reject('no results');
            }
            resolve(found);
         })
      }

      module.exports.getPostById = (id) =>
      {
        return new Promise((resolve,reject) =>
         {
            var found = posts.filter(posts => posts.id == id);
            const uniquePost = found[0];
         //    if (found.length == 0) {
         //        reject('no results');
         //    }
         //    
         //    resolve(found);
         if (uniquePost) {
          
            resolve(uniquePost);
        }
        else {
            reject("no result returned");
        }
          }
         
         
         )
      }


    
      
  module.exports.getPublishedPostsByCategory = (category)=> {
    
    return new Promise((resolve, reject) => {
      if(category) {
      
      const post = posts.filter( posts => posts.category == category && posts.published == true);
       
         resolve(post); 
      } else {
        
         reject("no results returned");
      }
   });
  
  
    }