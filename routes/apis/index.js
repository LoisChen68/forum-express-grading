const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')
const upload = require('../../middleware/multer')

router.use('/admin', authenticated, authenticatedAdmin, admin)

router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/users/:id/favorite', authenticated, userController.getUserFavoritedRestaurants)
router.get('/users/:id/comment', authenticated, userController.getUserCommentedRestaurants)
router.get('/users/:id/following', authenticated, userController.getUserFollowings)
router.get('/users/:id/follower', authenticated, userController.getUserFollowers)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getRestaurantFeeds)
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)

router.get('/comment/feeds', authenticated, commentController.getCommentFeeds)
router.get('/comments/:id', authenticated, commentController.editComment)
router.post('/comments', authenticated, commentController.postComment)
router.put('/comments/:id', authenticated, commentController.putComment)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.use('/', apiErrorHandler)

module.exports = router
