const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
async function handleCreateBudget(req, res) {
  const body = req.body;
  if (!body.amount || !body.category)
    return res.status(400).json({ error: "all fields are required" });

  const dbres = await Budget.create({
    user: req.user.id,
    amount: body.amount,
    category: body.category.toLowerCase(),
    date: body.date,
  });

  return res.json(dbres);
}

async function handleGetBudget(req, res) {
  try {
    const userId = req.user.id;

    // Fetch all budgets for the user
    const budgets = await Budget.find({ user: userId });

    // Initialize an array to store remaining budgets
    const remainingBudgets = [];

    // Iterate over each budget
    for (const budget of budgets) {
      const { category, amount, createdAt } = budget;

      // Find transactions for the same user and category after the budget creation date
      const transactions = await Transaction.find({ user: userId, category, date: { $gte: createdAt } });
      
      // Calculate total expenses for the category
      const totalExpense = transactions.reduce((acc, curr) => acc + curr.amount, 0);

      // Calculate remaining budget for the category
      const remainingAmount = amount - totalExpense;

      // Push the category and remaining budget to the array
      remainingBudgets.push({ category, remainingAmount, originalAmount: amount, createdAt });
    }

    res.json(remainingBudgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}


async function handleDeleteBudget(req, res) {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json("No such budget found");
    }
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }
    note = await Budget.findByIdAndDelete(req.params.id);
    return res.status(200).json("Budget Deleted!");
  } catch (e) {
    console.log(e);
    return res.status(500).send("internal server error");
  }
}

async function handleRemaningBudget(req, res) {
  try {
    const userId = req.user.id;

    // Find budgets for the specified user
    const budgets = await Budget.find({ user: userId });
    // Array to store the remaining budget for each category
    const remainingBudgets = [];

    // Iterate over each budget
    for (const budget of budgets) {
      const { category, amount, createdAt } = budget;

      // Find transactions for the same user and category
      const transactions = await Transaction.find({
        user: userId,
        category,
        date: { $gte: createdAt },
      });
      // Calculate total expenses for the category
      const totalExpense = transactions.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );

      // Calculate remaining budget for the category
      const remainingAmount = amount - totalExpense;

      // Push the category and remaining budget to the array
      remainingBudgets.push({
        category,
        remainingAmount,
        originalAmount: amount,
      });
    }

    res.json(remainingBudgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

module.exports = {
  handleCreateBudget,
  handleGetBudget,
  handleDeleteBudget,
  handleRemaningBudget,
};
