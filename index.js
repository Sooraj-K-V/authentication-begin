import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import pool from "./db.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

pool
  .connect()
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log("DB connection error occured!"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users2(email, password) values($1, $2)",
      [email, hashedPassword]
    );
    return res.render("secrets.ejs", { message: "Successfully registered!" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.username;
    const password = req.body.password;

    // Query the database for the user
    const result = await pool.query("SELECT * FROM users2 WHERE email = $1", [email]);

    // If no user found, return an error
    if (result.rowCount === 0) {
      return res.status(401).send("User not found!"); // Prevent accessing rows[0] if user doesn't exist
    }

    // Get user data
    const user = result.rows[0];

    // Compare hashed password
    const comparePassword = await bcrypt.compare(password, user.password);

    if (comparePassword) {
      return res.render("secrets.ejs"); 
    } else {
      return res.send("Password Incorrect!"); 
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ err: error.message }); 
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
