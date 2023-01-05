const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.json(data))
  },
  getTopRestaurants: (req, res, next) => {
    restaurantServices.getTopRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  },
  getRestaurantFeeds: (req, res, next) => {
    restaurantServices.getRestaurantFeeds(req, (err, data) => err ? next(err) : res.json(data))
  }
}
module.exports = restaurantController
