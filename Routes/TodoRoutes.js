const todoRoutes = require("express").Router();
const dataModel = require("../Models/DataModel");
const authMiddleware = require("../middleware/authMiddleware"); // Import auth middleware

// Apply authentication middleware to all routes
todoRoutes.use(authMiddleware);

// Get all todos for the logged-in user
todoRoutes.get("/getTodo", async (req, res) => {
  try {
    const { _id } = req.user;
    console.log("User ID from token:", _id);

    let todo = await dataModel.findById(_id);
    if (!todo) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(todo.todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new todo
todoRoutes.post("/postTodo", async (req, res) => {
  try {
    const { _id } = req.user;
    const todo = req.body;

    let userTodo = await dataModel.findById(_id);
    if (!userTodo) {
      return res.status(404).json({ error: "User not found" });
    }

    await dataModel.findByIdAndUpdate(_id, { $push: { todos: todo } });
    res.json({ success: "Posted Successfully" });
  } catch (error) {
    console.error("Error posting todo:", error);
    res.status(500).json({ error: "Server error" });
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
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a todo
todoRoutes.delete("/deleteTodo/:todoId", async (req, res) => {
  try {
    const { _id } = req.user;
    const { todoId } = req.params;

    let userTodo = await dataModel.findById(_id);
    if (!userTodo) {
      return res.status(404).json({ error: "User not found" });
    }

    await dataModel.findByIdAndUpdate(_id, { $pull: { todos: { todoId } } });

    res.json({ success: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = todoRoutes;
