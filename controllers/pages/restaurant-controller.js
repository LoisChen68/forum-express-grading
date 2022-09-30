const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')
const { sequelize } = require('../../models')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', data))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' }
      ],
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      limit: 10,
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Favorites AS FavoritedUsers WHERE restaurant_id = Restaurant.id )'
            ), 'FavoritedCount'
          ]
        ]
      },
      order: [
        [sequelize.literal('FavoritedCount'), 'Desc']
      ]
    })
      .then(restaurants => {
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const result = restaurants
          .map(restaurant => ({
            ...restaurant.toJSON(),
            isFavorited: favoritedRestaurantsId.includes(restaurant.id)
          }))
        return res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
