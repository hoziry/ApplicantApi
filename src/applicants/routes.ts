import express, { Request, Response } from "express";
import { pool } from '../pool';

const router = express.Router();

//Base End point, returns my info!
router.get("/awesome/applicant", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Applicant where id = 1");
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});
//Insert applicant
router.post("/applicants", async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ error: "Request body cannot be empty in this request." });
    }
    const requiredFields = ["first_name", "last_name", "age", "email"];

    // Obtain values from the request body
    const { first_name, last_name, age, email, professional_desc, hobbies } =
      req.body;

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    // If any required fields are missing, return an error response
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: "Missing required fields.", missingFields });
    }

    // Insert data into the applicants table
    const result = await pool.query(
      "INSERT INTO applicant (first_name, last_name, age, email, professional_desc, hobbies) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [first_name, last_name, age, email, professional_desc, hobbies]
    );

    // Return the inserted row as a response
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Obtain all applicants
router.get("/applicants", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM applicant order by id asc");
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Obtain applicant by ID
router.get("/applicants/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM applicant WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update an applicant by ID
router.put("/applicants/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, age, email, professional_desc, hobbies } =
      req.body;

    const result = await pool.query(
      "UPDATE applicant SET first_name = $1, last_name = $2, age = $3, email = $4, professional_desc = $5, hobbies = $6 WHERE id = $7 RETURNING *",
      [first_name, last_name, age, email, professional_desc, hobbies, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Endpoint to update specific fields of an applicant by ID using PATCH
router.patch("/applicants/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updateFields = Object.keys(updates);
    const updateValues = Object.values(updates);

    const updateSet = updateFields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE applicant SET ${updateSet} WHERE id = $${
        updateFields.length + 1
      } RETURNING *`,
      [...updateValues, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete an applicant by ID
router.delete("/applicants/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM applicant WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    res.json({ message: "Applicant deleted successfully." });
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Check if an applicant exists by ID
router.head("/applicants/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT 1 FROM applicant WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).end();
    }

    res.status(200).end();
  } catch (error) {
    console.error("Error executing PostgreSQL query:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Provide information about available methods for a resource
router.options("/applicants/:id", async (_req: Request, res: Response) => {
  res.header("Allow", "GET, POST, HEAD, PUT, PATCH, DELETE");
  res.status(200).end();
});

export default router;
