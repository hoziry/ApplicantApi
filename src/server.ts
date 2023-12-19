import express from "express";
import routes from "./applicants/routes";
import { json } from "body-parser";
import { pool } from './pool';

const app = express();
const port = 3000;

// Add the JSON body parser middleware
app.use(json());

app.use("/", routes);
// Start the server
const server = app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);

  // Test PostgreSQL connection
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL at:', result.rows[0].now);
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
  }
});

export default server; // Export the server instance