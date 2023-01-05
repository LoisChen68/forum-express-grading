const { Restaurant, Category, sequelize, Comment, User } = require('../models')
const { getOffset } = require('../helpers/pagination-helper')
const restaurantServices = {
  // GET restaurants 取得所有餐廳
  getRestaurants: (req, cb) => {
    const DEFAULT_PAGE = 1
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || DEFAULT_PAGE
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    const categoryId = Number(req.query.categoryId) || ''
    return Promise.all([
      Restaurant.findAndCountAll({
        include: [Category],
        where: {
          ...categoryId ? { categoryId } : ''
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
        offset
      })
    ])
      .then(restaurants => {
        // 透過 req.user 帶入收藏餐廳的id
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        // 比對是否收藏
        const isFavorited = restaurants[0].rows.some(restaurant => restaurant.id === favoritedRestaurantsId)
        // 透過 req.user 帶入喜歡餐廳的id
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
        // 比對是否喜歡
        const isLiked = restaurants[0].rows.some(restaurant => restaurant.id === likedRestaurantsId)
        const result = restaurants[0].rows.map(restaurant => {
          const { Category, ...data } = restaurant.toJSON()
          data.categoryName = Category.name
          data.isFavorited = isFavorited
          data.isLiked = isLiked
          return data
        })
        return cb(null, {
          count: restaurants[0].count,
          page: page,
          limit: limit,
          restaurants: result
        })
      })
      .catch(err => cb(err))
  },
  // GET restaurants/:id 取得單筆餐廳
  getRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        {
          model: Comment,
          include: {
            model: User,
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
          }
        },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      order: [[Comment, 'created_at', 'Desc']]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        const { Category, FavoritedUsers, LikedUsers, Comments, ...data } = restaurant.toJSON()
        data.isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        data.isLiked = restaurant.LikedUsers.some(f => f.id === req.user.id)
        data.categoryName = Category.name
        restaurant.increment('viewCounts')
        return cb(null, data)
      })
      .catch(err => cb(err))
  },
  // GET restaurants/top 取得人氣餐廳
  getTopRestaurants: (req, cb) => {
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
        return cb(null, result)
      })
      .catch(err => cb(err))
  },
  // GET restaurants/feeds 取得餐廳最新動態
  getRestaurantFeeds: (req, cb) => {
    const DEFAULT_LIMIT = 10
    const RestaurantFeedsLimit = Number(req.query.limit) || DEFAULT_LIMIT
    Restaurant.findAll({
      limit: RestaurantFeedsLimit,
      order: [['createdAt', 'DESC']],
      include: [Category]
    })
      .then(restaurants => {
        const result =
          restaurants.map(restaurant => {
            const { Category, ...data } = restaurant.toJSON()
            data.categoryName = Category.name
            return data
          })
        return cb(null, result)
      })
      .catch(err => cb(err))
  }
}
module.exports = restaurantServices
