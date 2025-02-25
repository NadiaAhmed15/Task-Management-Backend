const todoRoutes = require("express").Router();
const dataModel = require("../Models/DataModel");
const authMiddleware = require("../middleware/authMiddleware"); // Import auth middleware

// Helper function for error responses
const handleErrorResponse = (res, error, statusCode = 500) => {
  console.error(error);
  return res.status(statusCode).json({ error: error.message || "Server error" });
};

// Apply authentication middleware to all routes
todoRoutes.use(authMiddleware);

// Get all todos for the logged-in user
todoRoutes.get("/getTodo", async (req, res) => {
  try {
    const { _id } = req.user;
    console.log("User ID from token:", _id);

    const userTodo = await dataModel.findById(_id);
    if (!userTodo) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userTodo.todos);
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Add a new todo
todoRoutes.post("/postTodo", async (req, res) => {
  try {
    const { _id } = req.user;
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Todo title is required" });
    }

    const newTodo = {
      todoId: crypto.randomUUID(),
      title,
      status: false,
    };

    const userTodo = await dataModel.findById(_id);
    if (!userTodo) {
      return res.status(404).json({ error: "User not found" });
    }

    userTodo.todos.push(newTodo);
    await userTodo.save();  // save the updated document
    res.json({ success: "Posted Successfully" });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Update todo status
todoRoutes.patch("/updateTodo/:todoId", async (req, res) => {
  try {
    const { todoId } = req.params;
    const { status } = req.body;

    const updatedTodo = await dataModel.findOneAndUpdate(
      { "todos.todoId": todoId },
      { $set: { "todos.$.status": status } },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ success: "Updated successfully" });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// Delete a todo
todoRoutes.delete("/deleteTodo/:todoId", async (req, res) => {
  try {
    const { _id } = req.user;
    const { todoId } = req.params;

    const userTodo = await dataModel.findById(_id);
    if (!userTodo) {
      return res.status(404).json({ error: "User not found" });
    }

    const todoExists = userTodo.todos.some((todo) => todo.todoId === todoId);
    if (!todoExists) {
      return res.status(404).json({ error: "Todo not found" });
    }

    userTodo.todos = userTodo.todos.filter((todo) => todo.todoId !== todoId);
    await userTodo.save();

    res.json({ success: "Deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

module.exports = todoRoutes;
