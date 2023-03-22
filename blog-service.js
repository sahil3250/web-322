const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;


// set up sequelize to point to our postgres database
var sequelize = new Sequelize('hjyymrzx', 'hjyymrzx', 'ZqbfnKV2x4Ryus8J8LMHNepP5pdK5fDo', {
    host: 'mahmud.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
});
var Post = sequelize.define('post',{
  
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN

})

var Category = sequelize.define('Category', {

    category: Sequelize.STRING

});

Post.belongsTo(Category, {foreignKey: 'category'});


module.exports.initialize = function () {
  
   
    return new Promise((resolve, reject) => {
       

      
        sequelize.sync().then(()=> {
            
            console.log('Database synced successfully');
            
            resolve();
        })  
        .catch((error) => {
            console.log('Unable to sync the database:', error);
            reject('Unable to sync the database');
          });

});

}

module.exports.getAllPosts = ()=>{

    return new Promise((resolve, reject) => {
        let post = Post.findAll();

          if(post)
          {
            
                resolve(post);
          }
          else{
            reject();
          }
         
});

}

module.exports.getPostsByCategory = (cat)=>{
    return new Promise((resolve, reject) => {
       Post.findAll({where:
    {
        category: cat
    }}).then(posts => { 
        
        if (posts.length > 0) {
            resolve(posts);
          } else {
            reject("no results returned");
          }
    })
    .catch(error => {
        reject(error.message);
    
        })
});

}

module.exports.getPostsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
       
Post.findAll({
    where: {
        postDate: {
            [gte]: new Date(minDateStr)
        }
    }
})
.then(posts => {
    if (posts.length > 0) {
      resolve(posts);
    } else {
      reject("No posts found with the given minimum date");
    }
  })
  .catch(error => {
    reject(error.message);

    })
});
}


module.exports.getPostById = function(ID){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: ID
    
            }
        })
        .then(posts => {
            if (posts.length > 0) {

              resolve(posts[0]);
            } else {
              reject("No posts found with id: ${ID}" );
            }
          })
          .catch(error => {
            reject(error.message);
        
            })
});

}

module.exports.addPost = function(postData){

    postData.published = (postData.published) ? true : false;
  
    console.log(postData);

    for (const property in postData) {
        if(postData[property] == "")
        {
            postData[property] = null;
        }
    }
    postData.postDate = new Date();
    return new Promise((resolve, reject) => {
        sequelize.sync().then(Post.create(postData)
        .then(post => {
          resolve(post);
        })
        .catch(error => {
          reject("Unable to create post");
        }));
});

}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(Post.findAll()
        .then(posts => {
          const publishedPosts = posts.filter(post => post.published === true);
          resolve(publishedPosts);
        })
        .catch(error => {
          return Promise.reject("No results returned");
        }));
});

}

module.exports.getPublishedPostsByCategory = function(cat){
    return new Promise((resolve, reject) => {
        
        sequelize.sync().then(Post.findAll({where:
                {
                    category: cat
                }}
        )
        .then(posts => {
          const publishedPosts = posts.filter(post => post.published === true);
          resolve(publishedPosts);
        })
        .catch(error => {
          return Promise.reject("No results returned");
        }));
});

}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {

        let category = Category.findAll();
       if(category)
       {
        resolve(category)
       }
       else
       {
        reject();
       }
});

}

module.exports.addCategory = function(categoryData){
    for (const property in categoryData) {
        if(categoryData[property]== "")
        {
            categoryData[property] = null;
        }
    }
    console.log(categoryData);
    return new Promise((resolve, reject) => {
        sequelize.sync().then(  Category.create(categoryData)
        .then(category => {
          resolve(category);
        })
        .catch(error => {
          reject("Unable to create category");
        }));
});

}

module.exports.deleteCategoryById = ID =>
{
    return new Promise ((resolve,reject) =>
    {
        Category.destroy({
            where: { id: ID }
        }).then( resolve()).catch( reject("unable to delete category"));
    })

}
module.exports.deletePostById = ID =>
{
    return new Promise ((resolve,reject) =>
    {
    

        Post.destroy({
            where: { id: ID }
        }).then( 
            
            resolve())
        .catch( reject("unable to delete post"));
    })

}