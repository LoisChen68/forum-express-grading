const { Restaurant, Category, sequelize, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { getUser } = require('../helpers/auth-helpers')
const restaurantServices = {
  getRestaurants: (req, cb) => {
    const sortTab = [
      {
        name: '話題餐廳'
      },
      {
        name: '熱門餐廳'
      }
    ]
    const sortTabName = req.query.tab || ''
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    const categoryId = Number(req.query.categoryId) || ''
    return Promise.all([
      Restaurant.findAndCountAll({
        include: [
          Category,
          Comment
        ],
        where: {
          ...categoryId ? { categoryId } : {}
        },
        attributes: {
          include: [
            [
              sequelize.literal(
                '(SELECT COUNT(*) FROM Comments WHERE restaurant_id = Restaurant.id )'
              ), 'CommentsCount'
            ]
          ]
        },
        order: [
          [sequelize.literal('CommentsCount'), 'Desc']
        ],
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        const set = new Set()
        const result = data.filter(item => !set.has(item.id) ? set.add(item.id) : false)
        return cb(null, {
          restaurants: result,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count),
          sortTab,
          sortTabName
        })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    const reqUser = getUser(req)
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      order: [[Comment, 'created_at', 'Desc']],
      nest: true
    })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(f => f.id === req.user.id)
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        restaurant.increment('viewCounts')
        return cb(null, {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked,
          reqUser
        })
      })
      .catch(err => cb(err))
  }
}
module.exports = restaurantServices
