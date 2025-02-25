const express = require("express");
const todoRoutes = express.Router();
const dataModel = require("../Models/DataModel");

// Get todos
todoRoutes.get("/getTodo", async (req, res) => {
  try {
    const { _id } = req.user;
    console.log("Fetching todos for user:", _id);
    
    const todoList = await dataModel.findById(_id);
    if (!todoList) return res.status(404).json({ error: "No todos found" });

    res.json(todoList.todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Post a new todo
todoRoutes.post("/postTodo", async (req, res) => {
  try {
    const { _id } = req.user;
    const todo = req.body;

    console.log(`Posting todo for user ${_id}:`, todo);

    const userTodos = await dataModel.findById(_id);
    if (!userTodos) return res.status(404).json({ error: "User not found" });

    await dataModel.findByIdAndUpdate(_id, { $push: { todos: todo } }, { new: true });

    res.json({ success: "Posted Successfully" });
  } catch (error) {
    console.error("Error posting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a todo
todoRoutes.patch("/updateTodo/:todoId", async (req, res) => {
  try {
    const { _id } = req.user;
    const { todoId } = req.params;
    const { status } = req.body;

    const result = await dataModel.findOneAndUpdate(
      { _id: _id, "todos.todoId": todoId },
      { $set: { "todos.$.status": status } },
      { new: true }
    );

    if (!result) return res.status(404).json({ error: "Todo not found" });

    res.json({ success: "Updated successfully" });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a todo
todoRoutes.delete("/deleteTodo/:todoId", async (req, res) => {
  try {
    const { _id } = req.user;
    const { todoId } = req.params;

    const result = await dataModel.findByIdAndUpdate(
      _id,
      { $pull: { todos: { todoId: todoId } } },
      { new: true }
    );

    if (!result) return res.status(404).json({ error: "Todo not found" });

    res.json({ success: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = todoRoutes;
