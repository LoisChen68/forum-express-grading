const { Restaurant, Category } = require('../models')
const adminServices = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })

      .then(restaurants => cb(null, { restaurants }))

      .catch(err => cb(err))
  }
}
module.exports = adminServices
