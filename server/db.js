const pg = require ('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const client = new pg.Client(process.env.DATABASE_URL ||"postgres://janayacooper:1116@localhost:5432/acme_store_db");

// createTables: A method that drops and creates the tables for your application.
const createTables = async()=>{
const SQL = `
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;

CREATE TABLE users(
id UUID PRIMARY KEY, 
username VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) 
);

CREATE TABLE products(
id UUID PRIMARY KEY,
name VARCHAR(100) NOT NULL
);

CREATE TABLE favorites(
id UUID PRIMARY KEY,
product_id UUID REFERENCES products(id) NOT NULL,
user_id UUID REFERENCES users (id) NOT NULL,
CONSTRAINT unique_product_user UNIQUE (product_id, user_id)
);
`;
await client.query(SQL);
};

// createUser: A method that creates a user in the database and then returns the created record. The password of the user should be hashed by using Bcrypt

const createUser = async (username,password)=>{
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const SQL = `
      INSERT INTO users(id, username, password) 
      VALUES($1, $2, $3) 
      RETURNING *`;
    const response = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
    return response.rows[0];
  } catch (error) {
    console.error("Error creating user: ", error);
  }
};

// createProduct: A method that creates a product in the database and then returns the created record.
const createProduct = async(name)=>{
  try {
    const SQL = `
      INSERT INTO products(id, name) 
      VALUES($1, $2) 
      RETURNING *`;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
  } catch (error) {
    console.error("Error creating product: ", error);
  }
};

// createFavorite: A method that creates a favorite in the database and then returns the created record,
const createFavorite = async({ userId, productId }) => {

    const SQL = `
      INSERT INTO favorites(id, user_id, product_id) 
      VALUES($1, $2, $3) 
      RETURNING *`;
    const response = await client.query(SQL, [uuid.v4(), userId, productId]);
    return response.rows[0];
  };

// fetchUsers: A method that returns an array of users in the database.
const fetchUsers = async()=>{
  try {
    const SQL = `SELECT * FROM users`;
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.error("Error fetching users ");
    throw error; 
  }
};
  


// fetchProducts: A method that returns an array of products in the database.
const fetchProducts = async()=>{
  try {
    const SQL = `SELECT * FROM products`;
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.error("Error fetching products ");
  }
};


// fetchFavorites: A method that returns an array of favorites for a user,
const fetchFavorites = async(userId)=>{
  try {
    const SQL = `SELECT * FROM favorites WHERE user_id = $1`;
    const response = await client.query(SQL, [userId]);
    return response.rows;
  } catch (error) {
    console.error("Error fetching favorites ");
  }
};


// destroyFavorite: A method that deletes a favorite in the database.
const destroyFavorite = async({ userId, favoriteId })=>{
  try {
    const SQL = `DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING * `;
    const response = await client.query(SQL, [favoriteId, userId]);
    return response.rowCount > 0; // Return true if something was deleted
  } catch (error) {
    console.error("Error deleting favorite: ", error);
  }
};

  const init = async () => {
    try {
      console.log("Initializing DB layer...");
      await client.connect();
      await createTables();

      // Create Users 
      const ariel = await createUser("Ariel", "password");
      const cinderella = await createUser("Cinderella", "password");
      const pocahontas = await createUser("Pocahontas", "password");
      const snowWhite = await createUser("SnowWhite", "password");
      console.table(await fetchUsers());

      //Create Products 
      const macbook = await createProduct("Macbook");
      const metaGlasses = await createProduct("Meta Glasses");
      const airphonesMax = await createProduct("Airphones Max");
      const ipad = await createProduct("iPad");
      console.table(await fetchProducts());

// Create Favorites using the stored user and product IDs
await createFavorite({ userId: ariel.id, productId: macbook.id });
await createFavorite({ userId: cinderella.id, productId: metaGlasses.id });
await createFavorite({ userId: pocahontas.id, productId: ipad.id });
await createFavorite({ userId: snowWhite.id, productId: airphonesMax.id });

console.table(await fetchFavorites(ariel.id));
} catch (error) {
console.error("Error during DB initialization", error);
}
};


// start the database
init();

module.exports ={
  client,
  init,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
  createTables,
};