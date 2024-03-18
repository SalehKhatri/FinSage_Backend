const express = require('express')
const {authUser}=require('../middleware/authUser');
const {body}=require('express-validator')
const {handleAddTransaction,handleGetAllTransactions, handleGetTransaction, handleGetBalance,handleGetWeeklyExpense, handleDeleteTransaction, handleCategoryWiseExpense}=require('../controllers/transaction')
const router=express.Router();

router.post('/addTransaction',[
  body('amount').notEmpty().withMessage("Amount is required").isNumeric(),
  body('type').trim().isIn(['income', 'expense']).withMessage('Type must be either "income" or "expense"').notEmpty().withMessage("type is required"),
  body('category').trim().notEmpty().withMessage('Category is required')
],authUser,handleAddTransaction)

router.get('/getTransaction',authUser,handleGetAllTransactions)

router.get('/getTransaction/:type',authUser,handleGetTransaction)

router.get('/balance',authUser,handleGetBalance);

router.get('/weeklyExpense',authUser,handleGetWeeklyExpense)

router.delete('/delete/:transactionId', authUser, handleDeleteTransaction)

router.get('/categoryWiseExpense', authUser , handleCategoryWiseExpense)

module.exports=router;
