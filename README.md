# Applicant Api

Small Application built with Node Js and Express. Unit Tested with Jest.

# Installation

npm install

# Start

npm run start

# Tests

npm run test

# Requirements

- .env file containing the following:
  DB_HOST=localhost
  DB_PORT=
  DB_USER=
  DB_PASSWORD=
  DB_NAME=
- PostgreSQL db with a table schema : Applicant (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  age INT,
  email VARCHAR(100),
  professional_desc VARCHAR(1000),
  hobbies VARCHAR(1000)
  );
