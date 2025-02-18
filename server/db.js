const pg = require ('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const client = new pg.Client(process.env.DATABASE_URL ||"postgres:janayacooper:1116@localhost:5432/acme_store_db")

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
name VARCHAR(100) NOT NULL;

CREATE TABLE favorites(
id UUID PRIMARY KEY,
product_id UUID REFERENCES products(id) NOT NULL,
user_id UUID REFERENCES users (id) NOT NULL,
CONSTRAINT unique_product_user UNIQUE (product_id, user_id);
);
`;
await client.query(SQL);
};

// createUser: A method that creates a user in the database and then returns the created record. The password of the user should be hashed by using Bcrypt

const createUser = async(username,password)=>{
const hashedPassword = await bcrypt.hash(password,5);  
const SQL = `
INSERT INTO users(id,username, password) VALUES($1,$2,$3) RETURNING * `;
const result = client.query (SQL, [uuid.v4(),username,hashedPassword]);
return result.rows[0];
};


// createProduct: A method that creates a product in the database and then returns the created record.
const createProduct = async(name)=>{
    const SQL = `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
}

// createFavorite: A method that creates a favorite in the database and then returns the created record,
const createFavorite = async({ userId, productId }) => {
    const SQL = `
      INSERT INTO favorites(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), userId, productId]);
    return response.rows[0];
  };

// fetchUsers: A method that returns an array of users in the database.
const fetchUsers = async()=>
  {const SQL = `SELECT * FROM users`;
    const response = await client.query(SQL);
    return response.rows;
  };


// fetchProducts: A method that returns an array of products in the database.
const fetchProducts = async()=>{
    const SQL = `SELECT * FROM products`;
    const response = await client.query(SQL);
    return response.rows;
  };


// fetchFavorites: A method that returns an array of favorites for a user,
const fetchFavorites = async(userId)=>{const SQL = `SELECT * FROM favorites WHERE user_id = $1`;
    const response = await client.query(SQL, [userId]);
    return response.rows;
  };



// destroyFavorite: A method that deletes a favorite in the database.
const destroyFavorite = async({ userId, favoriteId })=>{
    const SQL = `DELETE FROM favorites WHERE id = $1 AND user_id = $2`;
    await client.query(SQL, [favoriteId, userId]);
  };


const init = async () =>{
    console.log("init db layer");
    await client.connect();
   await createTables();
    await createUser("Ariel","password");
    await createUser("Cinderella,password")
    console.table(await fetchUsers());
}

module.exports ={
    init, 
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite

}