const { ObjectId } = require("mongodb");
const Transaction = require("../models/Transaction");
const { validationResult } = require("express-validator");
const moment = require("moment");

async function handleAddTransaction(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const body = req.body;
    const newTransaction = await Transaction.create({
      user: req.user.id,
      amount: body.amount,
      type: body.type.toLowerCase(),
      description: body.description,
      category: body.category.toLowerCase(),
      date: body.date,
    });

    res.status(201).json({
      message: "Transaction added successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

async function handleDeleteTransaction(req, res) {
  try {
    const transactionId = req.params.transactionId;
    const transaction = await Transaction.findById(transactionId);
    if(!transaction) return res.status(404).json("Not found!")
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }
    // Find the transaction by ID and delete it
    const deletedTransaction = await Transaction.findByIdAndDelete(
      transactionId
    );

    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      message: "Transaction deleted successfully",
      transaction: deletedTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

// Get all transactions!
async function handleGetAllTransactions(req, res) {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort('date');
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

// get transaction based on type  i.e income or expense
async function handleGetTransaction(req, res) {
  try {
    const type = req.params.type.toLowerCase();
    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "Invalid type parameter" });
    }
    let transactions = await Transaction.find({ user: req.user.id, type }).sort('date');

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

async function handleGetBalance(req, res) {
  try {
    // Calculate total income
    const totalIncome = await Transaction.aggregate([
      { $match: { user: new ObjectId(req.user.id), type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate total expense
    const totalExpense = await Transaction.aggregate([
      { $match: { user: new ObjectId(req.user.id), type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    console.log(totalExpense, totalIncome);
    const income = totalIncome.length > 0 ? totalIncome[0].total : 0;
    const expense = totalExpense.length > 0 ? totalExpense[0].total : 0;

    const balance = income - expense;
    res.json({ balance, income, expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

async function handleGetWeeklyExpense(req, res) {
  try {
    const today = moment();
    const sevenDaysAgo = today.clone().subtract(6, 'days'); // Start counting 7 days from yesterday

    // Generate an array of dates for the past 7 days
    const dates = [];
    let currentDate = sevenDaysAgo.clone();
    for (let i = 0; i < 7; i++) {
      dates.push(currentDate.format('MM/DD'));
      currentDate.add(1, 'day');
    }

    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: new ObjectId(req.user.id),
          type: "expense",
          date: { $gte: sevenDaysAgo.toDate(), $lte: today.toDate() }, // Include today's date
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m/%d", date: "$date" } }, // Format date as MM/DD
          totalExpensePerDay: { $sum: "$amount" },
        },
      },
      {
        $sort: { '_id': 1 } // Sort by date in ascending order
      },
      {
        $group: {
          _id: null,
          expensesPerDay: {
            $push: { day: "$_id", totalExpense: "$totalExpensePerDay" },
          },
          totalExpense: { $sum: "$totalExpensePerDay" },
        },
      },
    ]);

    // Merge expenses with dates, filling in missing dates with totalExpense 0
    const result =
      expenses.length > 0
        ? {
            expensesPerDay: dates.map(date => {
              const expense = expenses[0].expensesPerDay.find(e => e.day === date);
              return { day: date, totalExpense: expense ? expense.totalExpense : 0 };
            }),
            totalExpense: expenses[0].totalExpense,
          }
        : { expensesPerDay: dates.map(date => ({ day: date, totalExpense: 0 })), totalExpense: 0 };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}
async function handleCategoryWiseExpense(req,res){
  try {
    const userId = req.user.id;

    // Find total expenses grouped by category for the specified user
    const expensesByCategory = await Transaction.aggregate([
      { 
        $match: { user:new ObjectId(userId), type: 'expense' } 
      },
      {
        $group: {
          _id: '$category',
          totalExpense: { $sum: '$amount' }
        }
      }
    ]);

    res.json(expensesByCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}
module.exports = {
  handleAddTransaction,
  handleGetAllTransactions,
  handleGetTransaction,
  handleGetBalance,
  handleGetWeeklyExpense,
  handleDeleteTransaction,
  handleCategoryWiseExpense
};
