import request from "supertest";
import server from "../src/server";
import { pool } from "../src/pool";

describe("CRUD Operations", () => {
  let createdApplicantId: number;

  afterAll(async () => {
    // Clean up; Remove the applicant created during testing
    if (createdApplicantId) {
      await request(server).delete(`/applicants/${createdApplicantId}`);
      await server.close();
      await pool.end();
    }
  });
  it("should retrieve a the info of the awesome applicant", async () => {
    const response = await request(server).get(`/awesome/applicant`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
  });
  it("should create an applicant", async () => {
    const response = await request(server).post("/applicants").send({
      first_name: "Test Name",
      last_name: "Test Last Name",
      age: 30,
      email: "test@example.com",
      professional_desc: "Experienced software engineer",
      hobbies: "Reading, Coding",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    createdApplicantId = response.body.id;
  });

  it("should retrieve all applicants", async () => {
    const response = await request(server).get("/applicants");
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
  it("should retrieve an existing applicant by ID", async () => {
    const response = await request(server).get(
      `/applicants/${createdApplicantId}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", createdApplicantId);
  });

  it("should respond with status 404 for a non-existent applicant", async () => {
    const response = await request(server).get("/applicants/456");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Applicant not found." });
  });

  it("should respond with status 500 for a server error", async () => {
    // Mock a server error by making the database query throw an exception
    jest.spyOn(pool, "query").mockImplementationOnce(() => {
      throw new Error("Mocked database error");
    });

    const response = await request(server).get("/applicants/123");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });
  it("should update an existing applicant and respond with the updated data", async () => {
    const updatedApplicantData = {
      first_name: "UpdatedJohn",
      last_name: "Doe",
      age: 31,
      email: "updated.john.doe@example.com",
      professional_desc: "Updated software engineer",
      hobbies: "Updated Reading, Coding",
    };

    const response = await request(server)
      .put(`/applicants/${createdApplicantId}`)
      .send(updatedApplicantData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...updatedApplicantData,
      id: createdApplicantId,
    });

    // Verify that the applicant has been updated in the database
    const verificationQuery = "SELECT * FROM applicant WHERE id = $1";
    const verificationResult = await pool.query(verificationQuery, [
      createdApplicantId,
    ]);
    expect(verificationResult.rows.length).toBe(1);
    expect(verificationResult.rows[0]).toEqual({
      ...updatedApplicantData,
      id: createdApplicantId,
    });
  });

  it("should respond with status 404 for updating a non-existent applicant", async () => {
    const response = await request(server).put("/applicants/456").send({
      first_name: "UpdatedJohn",
      last_name: "Doe",
      age: 31,
      email: "updated.john.doe@example.com",
      professional_desc: "Updated software engineer",
      hobbies: "Updated Reading, Coding",
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Applicant not found." });
  });

  it("should respond with status 500 for a server error", async () => {
    // Mock a server error by making the database query throw an exception
    jest.spyOn(pool, "query").mockImplementationOnce(() => {
      throw new Error("Mocked database error");
    });

    const response = await request(server).put("/applicants/123").send({
      first_name: "UpdatedJohn",
      last_name: "Doe",
      age: 31,
      email: "updated.john.doe@example.com",
      professional_desc: "Updated software engineer",
      hobbies: "Updated Reading, Coding",
    });

    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });

  it("should update an applicant with Patch by ID", async () => {
    if (!createdApplicantId) {
      throw new Error("No created applicant ID to test update");
    }

    const response = await request(server)
      .patch(`/applicants/${createdApplicantId}`)
      .send({
        first_name: "UpdateTest",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("first_name", "UpdateTest");
  });
  it("should respond with status 200 if applicant exists", async () => {
    const response = await request(server).head(
      `/applicants/${createdApplicantId}`
    );

    expect(response.status).toBe(200);
  });

  it("should respond with status 404 if applicant does not exist", async () => {
    const response = await request(server).head("/applicants/123");

    expect(response.status).toBe(404);
  });
  it("should respond with status 200 and appropriate headers", async () => {
    const response = await request(server).options(
      `/applicants/${createdApplicantId}`
    );

    expect(response.status).toBe(200);
    expect(response.headers["allow"]).toEqual(
      "GET, POST, HEAD, PUT, PATCH, DELETE"
    );
  });
  it("should delete an existing applicant and respond with status 200", async () => {
    const response = await request(server).delete(
      `/applicants/${createdApplicantId}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Applicant deleted successfully.",
    });

    // Verify that the applicant has been deleted in the database
    const verificationQuery = "SELECT * FROM applicant WHERE id = $1";
    const verificationResult = await pool.query(verificationQuery, ["123"]);
    expect(verificationResult.rows.length).toBe(0);
  });

  it("should respond with status 404 for a non-existent applicant", async () => {
    const response = await request(server).delete(
      `/applicants/${createdApplicantId}`
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Applicant not found." });
  });

  it("should respond with status 500 for a server error", async () => {
    // Mock a server error by making the database query throw an exception
    jest.spyOn(pool, "query").mockImplementationOnce(() => {
      throw new Error("Mocked database error");
    });

    const response = await request(server).delete(
      `/applicants/${createdApplicantId}`
    );

    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });
});
