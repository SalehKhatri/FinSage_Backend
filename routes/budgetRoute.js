const express = require('express');
const {handleCreateBudget,handleGetBudget,handleDeleteBudget, handleRemaningBudget} = require('../controllers/budget');
const {authUser}=require('../middleware/authUser');
const router=express.Router();

router.post('/createBudget',authUser,handleCreateBudget)
router.get('/getBudget',authUser,handleGetBudget)
router.delete('/deleteBudget/:id',authUser,handleDeleteBudget)
router.get('/remaningBudget', authUser, handleRemaningBudget)

module.exports=router