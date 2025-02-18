const db = require('../db');
const express = require('express');
const {
  client,
  createTables,
  createUser,
  createSkill,
  createProduct,
  fetchProducts
} = require('./db'); = require('./db');
const app = express ();

// middleware 
app. use(express.json())


// Initalize the database 
 const init = async() =>{
  await client.connect();
  console.log("Connected to Database")
  await createTables();
  console.log ("Tables created");
  const [Ariel, Cinderella,Pocahontas , singing, dancing, juggling, plateSpinning] = await Promise.all([
    createUser({ username: 'Ariel', password: 'scs0234#' }),
    createUser({ username: 'Cinderella', password: 'ts3gh4!!' }),
    createUser({ username: 'Pocahontas', password: 'z!8459 ' }),
    createProduct({ name: 'Macbook'}),
    createProduct({ name: 'Ipad'}),
    createProduct({ name: 'Meta Glasses'}),
    createProduct({ name: 'Airphones Max'}),
  ]);
  // Fetch and log users and products
  const users = await fetchUsers();
  console.log(users);

  const products = await fetchProducts();
  console.log(products);
  // Log specific IDs for testing
  // console.log(Ariel.id);
  // console.log(Macbook.id)
 };

 // routes for users 

app.get('/api/users',async(req,res,next)=> {
try{
    const users = await fetchUser();
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
    const favorite = await createFavorite({ userId: req.params.id, productId: req.body.product_id });
    res.status(201).send(favorite);
  } catch (error) {
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
  console.error(error);
  res.status(500).send('Something went wrong!');
});

// Port for sever 
app.listen(3000, () => {
  console.log('Listening on port 3000');
});
init();