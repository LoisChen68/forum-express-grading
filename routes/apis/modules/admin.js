const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')
const commentController = require('../../../controllers/apis/comment-controller')
const upload = require('../../../middleware/multer')

router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)

router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

router.get('/categories', categoryController.getCategories)
router.get('/categories/:id', categoryController.getCategory)
router.post('/categories', categoryController.postCategory)
router.put('/categories/:id', categoryController.putCategory)
router.delete('/categories/:id', categoryController.deleteCategory)

router.delete('/comments/:id', commentController.deleteComment)

module.exports = router
