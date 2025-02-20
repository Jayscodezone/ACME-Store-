const db = require('./db');
const express = require('express');
const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
} = require('./db');
console.log(client);
const app = express ();

// middleware 
app.use(express.json());


// Initalize the database 
const init = async () => {
try {
  // await client.connect(); 
  console.log("Connected to Database");

  await createTables(); // Create tables
  console.log("Tables created");

  // Fetch and log users and products
  const users = await fetchUsers();
  console.log(users);

  const products = await fetchProducts();
  console.log(products);
} catch (error) {
  console.error("Error during DB initialization:", error);
}
};
  
 // routes for users 

app.get('/api/users',async(req,res,next)=> {
try{
    const users = await fetchUsers();
    res.send(users);
}catch(error){
next(error);

}
});
// Routes for products
app.get('/api/products', async (req, res, next) => {
  try {
    const products = await fetchProducts();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

// Routes for favorites
app.get('/api/users/:id/favorites', async (req, res, next) => {
  try {
    const favorites = await fetchFavorites(req.params.id);
    res.send(favorites);
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/:id/favorites', async (req, res, next) => {
  try {
    const { id:user_id} = req.params;
    const { product_id} = req.body;
   const favorites = await createFavorite({ 
        userId:user_id,
        productId: product_id,
        })
console.log (favorites);
        console.log("Received request body:", req.body); // Debugging
        console.log("Type of req.body:", typeof req.body);
        console.log("Extracted product_id:", product_id); // Debugging
     // Return the created favorite with status 201
     res.status(201).json(favorites);
    } catch (error) {
      console.error("Error creating favorite:", error);
      next(error);
    }
  });
  

app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
  try {
    await destroyFavorite({ userId: req.params.userId, favoriteId: req.params.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json(`Something went wrong: ${err}!`);
});

// Port for sever 
app.listen(3000, () => {
  console.log('Listening on port 3000');
});

//  init function
init();
