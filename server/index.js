const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer"); // image upload

const app = express();
const port = 3000;
const fs = require("fs");

const path = require("path");

const cors = require("cors");
app.use(cors()); // CORS Permissions

app.use(express.json({ limit: "100mb" })); // for JSON payloads
app.use(express.urlencoded({ limit: "100mb", extended: true })); // for URL-encoded payloads

const upload = multer({ dest: "uploads/" });

app.use(express.json()); //parse JSON request bodies

//Mongo Connection String ; Allowed connection from anywhere
const url =
  "mongodb+srv://saffiullahraja01:b1qe6hi8Q64bMKMk@plantbuddyclustor.h6k2z.mongodb.net/?retryWrites=true&w=majority&appName=PlantBuddyClustor";

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connection Success");
    const dbo = client.db("PlantBuddy");

    // GET API to retrieve all users ADMIN
    app.get("/getUsers", async (req, res) => {
      try {
        const users = await dbo.collection("Users").find({}).toArray();
        res.json(users);
      } catch (err) {
        console.error("Error retrieving users:", err);
        res.status(500).send(err);
      }
    });

    //Login ADMIN
    app.post("/adminLogin", async (req, res) => {
      const { email, password } = req.body;

      console.log(req.body);

      try {
        const user = await dbo
          .collection("AdminUsers")
          .findOne({ email: email });
        console.log(user);

        if (!user) {
          return res.status(400).send("Invalid username entered");
        }

        if (password === user.password) {
          return res.status(200).send(user);
        } else {
          // Password mismatch
          return res.status(400).send("Incorrect password entered");
        }
      } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    //Delete User ADMIN
    app.delete("/deleteUser/:id", async (req, res) => {
      const userId = req.params.id; // Get the user ID from the request parameters
      try {
        const result = await dbo
          .collection("Users")
          .deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 1) {
          res.status(200).json({ message: "User deleted successfully" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).send(err);
      }
    });

    //Get All Active Order ADMIN
    app.get("/getAllActiveOrders", async (req, res) => {
      try {
        const orders = await dbo
          .collection("Orders")
          .find({
            status: { $ne: "delete", $ne: "completed" },
          })
          .toArray();

        res.status(200).json({
          message: "Orders retrieved successfully",
          data: orders,
          status: true,
        });
      } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({
          message: "Error fetching orders",
          status: false,
        });
      }
    });

    //Get All Orders ADMIN
    app.get("/getAllOrders", async (req, res) => {
      try {
        const orders = await dbo.collection("Orders").find({}).toArray();

        res.status(200).json({
          message: "Orders retrieved successfully",
          data: orders,
          status: true,
        });
      } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({
          message: "Error fetching orders",
          status: false,
        });
      }
    });

    //API TO update Status Order ADMIN
    app.post("/updateOrderStatus", async (req, res) => {
      const { orderId, newStatus } = req.body; // Expecting a single order ID and the new status

      console.log(req.body);
      // Ensure that orderId is provided and newStatus is given
      if (!orderId || !newStatus) {
        return res.status(400).json({
          message: "Invalid input, expected an order ID and a new status.",
          status: false,
        });
      }

      try {
        // Update the status of the order with the given ID
        const result = await dbo
          .collection("Orders")
          .updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status: newStatus } }
          );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            message: "No order found with the provided ID.",
            status: false,
          });
        }

        res.status(200).json({
          message: "Order status updated successfully",
          matchedCount: result.matchedCount,
          status: true,
        });
      } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).send(err);
      }
    });

    //API TO Delete Order ADMIN
    app.post("/deleteOrders", async (req, res) => {
      const { orderIds } = req.body;
      // Expecting an array of order IDs

      // Ensure that orderIds is an array
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({
          message: "Invalid input, expected an array of order IDs.",
          status: false,
        });
      }

      try {
        // Delete the orders with the given IDs
        const result = await dbo
          .collection("Orders")
          .deleteMany({ _id: { $in: orderIds.map((id) => new ObjectId(id)) } });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            message: "No orders found with the provided IDs.",
            status: false,
          });
        }

        res.status(200).json({
          message: "Orders deleted successfully",
          deletedCount: result.deletedCount,
          status: true,
        });
      } catch (err) {
        console.error("Error deleting orders:", err);
        res.status(500).send(err);
      }
    });

    // APi to del the Article
    app.delete("/articles/:id", async (req, res) => {
      const articleId = req.params.id;
    
      try {
        const result = await dbo.collection("Articles").deleteOne({ _id: new ObjectId(articleId) });
    
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Article deleted successfully" });
        } else {
          res.status(404).json({ message: "Article not found" });
        }
      } catch (err) {
        console.error("Error deleting document:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
      }
    });
    

    //Register
    app.post("/register", async (req, res) => {
      const newUser = req.body;
      const { email, password, name, dateCreated } = req.body;

      console.log("POST call");
      console.log("Received request body:", newUser);

      const user = await dbo.collection("Users").findOne({ email });

      console.log(user);

      if (user) {
        return res.status(400).json({ message: "User Already Exists" });
      }

      if (!newUser || !newUser.email || !newUser.password) {
        return res.status(400).json({ message: "Invalid data received" });
      }

      // Append Score field
      newUser.Score = 0;
      newUser.ProfilePicture = "";

      try {
        const result = await dbo.collection("Users").insertOne(newUser);
        console.log("Insert result:", result);

        if (result.insertedId) {
          res.status(201).json({
            message: "User added successfully",
            id: result.insertedId,
          });
        } else {
          res.status(500).json({ message: "Failed to add user" });
        }
      } catch (err) {
        console.error("Error inserting document:", err);
        res.status(500).send(err);
      }
    });

    //Login
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      console.log(req.body);

      try {
        const user = await dbo.collection("Users").findOne({ email: email });
        console.log(user);

        if (!user) {
          return res.status(400).send("Invalid username entered");
        }

        if (password === user.password) {
          return res.status(200).send(user);
        } else {
          // Password mismatch
          return res.status(400).send("Incorrect password entered");
        }
      } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    // Upload Products by base64 Admin Listing of Products  category ===1 ? indoor : outDoor
    app.post("/uploadProducts", async (req, res) => {
      const { user_id, product_id, image, added_date, name, price, category } =
        req.body;

      try {
        const result = await dbo.collection("Products").insertOne({
          user_id,
          product_id,
          added_date,
          image: image,
          name,
          price,
          category,
        });
        res.status(201).json({
          message: "Image uploaded successfully",
          id: result.insertedId,
        });
      } catch (err) {
        console.error("Error inserting document:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    // Get all products Listed
    app.get("/getProducts", async (req, res) => {
      console.log();

      try {
        const user = await dbo.collection("Products").find({}).toArray();
        res.status(200).send(user);
      } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    //Place Order by User
    app.post("/placeOrder", async (req, res) => {
      const { orders } = req.body; // Expecting an array of order objects

      // Ensure that orders is an array
      if (!Array.isArray(orders)) {
        return res.status(400).json({
          message: "Invalid input, expected an array of orders.",
          status: false,
        });
      }

      try {
        // Create an array to hold the order insertions
        const orderInsertions = orders.map((order) => ({
          email: order.email,
          product_id: order.product_id,
          added_date: order.added_date,
          name: order.name,
          price: order.price,
          quantity: order.quantity,
          status: order.status || "", // Set default status to an empty string if not provided
        }));

        // Insert multiple documents into the Products collection
        const result = await dbo
          .collection("Orders")
          .insertMany(orderInsertions);

        res.status(201).json({
          message: "Orders Placed Successfully",
          ids: result.insertedIds,
          status: true,
        });
      } catch (err) {
        console.error("Error inserting products:", err);
        res.status(500).send(err);
      }
    });

    //Get All Orders by user_id
    app.get("/getAllOrders", async (req, res) => {
      const { user_id } = req.body;

      try {
        const result = await dbo
          .collection("Products")
          .find({ user_id })
          .toArray();
        res.status(201).json(result);
      } catch (err) {
        console.error("Error retrieving users:", err);
        res.status(500).send(err);
      }
    });

    // Store Favourites against user email
    app.get("/getfavourites", async (req, res) => {
      const { email } = req.query; // Get email from query parameters
      console.log("email", email);
      try {
        // Validate that email is provided
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        // Find favourites based on the provided email
        const result = await dbo
          .collection("FavouriteProducts")
          .find({ email: email }) // Adjust field name as necessary
          .toArray();
        console.log(result);
        res.json(result);
      } catch (err) {
        console.error("Error retrieving favourites:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    app.post("/addtofavourites", async (req, res) => {
      const { _id, email } = req.body;

      try {
        const data = await dbo
          .collection("Products")
          .findOne({ _id: new ObjectId(_id) });

        const result = await dbo.collection("FavouriteProducts").insertOne({
          data,
          email,
        });
        res.status(201).json({
          message: "Image uploaded successfully",
          id: result.insertedId,
        });
      } catch (err) {
        console.error("Error inserting document:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    app.post("/removefromfavourites", async (req, res) => {
      const { _id, email } = req.body;

      try {
        // Check if the required parameters are provided
        if (!_id || !email) {
          return res
            .status(400)
            .json({ message: "Bad Request: Missing required fields" });
        }

        // Remove the document from the FavouriteProducts collection
        const result = await dbo.collection("FavouriteProducts").deleteOne({
          _id: new ObjectId(_id),
          email: email,
        });

        // Check if any document was deleted
        if (result.deletedCount === 0) {
          return res
            .status(404)
            .json({ message: "No document found with the given criteria" });
        }

        res.status(200).json({ message: "Document removed successfully" });
      } catch (err) {
        console.error("Error removing document:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    app.get("/getcart", async (req, res) => {
      const { email } = req.query; // Use req.query for GET parameters
      console.log(email);
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      try {
        const result = await dbo.collection("Cart").find({ email }).toArray();
        res.status(200).json(result); // Return 200 for a successful retrieval
      } catch (err) {
        console.error("Error retrieving cart items:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    // Add to Cart against user email
    app.post("/addtocart", async (req, res) => {
      const { _id, quantity, email } = req.body;
      console.log(_id);
      try {
        const data = await dbo
          .collection("Products")
          .findOne({ _id: new ObjectId(_id) });
        console.log(data);
        const result = await dbo.collection("Cart").insertOne({
          data,
          email,
          quantity,
        });
        res.status(201).json({
          message: "Image uploaded successfully",
          //  id: result.insertedId,
        });
      } catch (err) {
        console.error("Error inserting document:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    // Remove specific object from cart
    app.post("/removecart", async (req, res) => {
      console.log(req.body);
      const { _id, email } = req.body;
      try {
        // Assuming you have the ObjectId from the MongoDB driver
        const result = await dbo.collection("Cart").deleteOne({
          "data._id": new ObjectId(_id), // Match the product ID
          email, // Match the user's email
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Item not found in cart" });
        }

        res
          .status(200)
          .json({ message: "Item removed from cart successfully" });
      } catch (err) {
        console.error("Error removing document:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    // Add Articles by Admin
    app.post("/uploadarticles", async (req, res) => {
      const { title, image, description } = req.body;

      try {
        const result = await dbo.collection("Articles").insertOne({
          image: image,
          title: title,
          description: description,
        });
        res.status(201).json({
          message: "Image uploaded successfully",
          id: result.insertedId,
        });
      } catch (err) {
        console.error("Error inserting document:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    // get Artcles
    app.get("/getarticles", async (req, res) => {
      try {
        const users = await dbo.collection("Articles").find({}).toArray();
        res.json(users);
      } catch (err) {
        console.error("Error retrieving users:", err);
        res.status(500).send(err);
      }
    });

    // upload personal pictures
    app.post("/uploadpersonalpictures", async (req, res) => {
      const { email, image } = req.body;
      try {
        // const data = await dbo
        //   .collection("Products")
        //   .findOne({ _id: new ObjectId(_id) });
        // console.log(data);
        const result = await dbo.collection("social_images").insertOne({
          email,
          image,
        });
        res.status(201).json({
          message: "Image uploaded successfully",
          //  id: result.insertedId,
        });
      } catch (err) {
        console.error("Error inserting document:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    // Get all the personal pictures FEED
    app.get("/getpersonalpictures", async (req, res) => {
      const userEmail = req.query.email; // Get the email from the query parameters
      console.log("Email", userEmail);
      try {
        // Check if userEmail is provided
        if (!userEmail) {
          return res.status(400).json({ error: "Email is required" });
        }

        // Query to exclude documents where the email matches req.query.email
        const users = await dbo
          .collection("social_images")
          .find({ email: { $ne: userEmail } })
          .toArray();
        res.json(users);
      } catch (err) {
        console.error("Error retrieving users:", err);
        res.status(500).send(err);
      }
    });

    //Get All Profile personal images
    app.get("/getprofilepersonalpictures", async (req, res) => {
      const userEmail = req.query.email; // Get the email from the query parameters
      console.log("Email", userEmail);

      try {
        // Check if userEmail is provided
        if (!userEmail) {
          return res.status(400).json({ error: "Email is required" });
        }

        // Query to find documents where the email matches userEmail
        const users = await dbo
          .collection("social_images")
          .find({ email: userEmail })
          .toArray();

        // Send back the found images
        res.json(users);
      } catch (err) {
        console.error("Error retrieving images:", err);
        res.status(500).send(err);
      }
    });

    app.post("/addscore", async (req, res) => {
      const { email, scoreToAdd } = req.body;

      console.log(req.body);
      // Validate input
      if (!email || scoreToAdd === undefined) {
        return res
          .status(400)
          .json({ message: "Email and score to add are required" });
      }

      try {
        // Update the user's score by adding the scoreToAdd
        const result = await dbo.collection("Users").findOneAndUpdate(
          { email }, // Find user by email
          { $inc: { Score: scoreToAdd } }, // Increment Score
          { returnDocument: "after" } // Return the updated document
        );

        res.status(200).json({
          message: "Score updated successfully",
          updatedUser: result.value,
        });
      } catch (err) {
        console.error("Error updating score:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
    });

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

main();
