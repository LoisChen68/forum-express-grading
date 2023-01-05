const { Restaurant, Category, Comment, User, sequelize } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const { getUser } = require('../../helpers/auth-helpers')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const sortTab = [
      {
        name: '話題餐廳'
      },
      {
        name: '熱門餐廳'
      }
    ]
    const sortTabName = req.query.tab || ''
    const DEFAULT_PAGE = 1
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || DEFAULT_PAGE
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
        return res.render('restaurants', {
          restaurants: result,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count),
          sortTab,
          sortTabName
        })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    const reqUser = getUser(req)
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
        const { Category, FavoritedUsers, LikedUsers, ...data } = restaurant.toJSON()
        data.isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        data.isLiked = restaurant.LikedUsers.some(f => f.id === req.user.id)
        data.categoryName = Category.name
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        restaurant.increment('viewCounts')
        return res.render('restaurant', { restaurant: data, reqUser })
      })
      .catch(err => next(err))
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
        include: [
          {
            model: User,
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
          },
          { model: Restaurant, attributes: ['name'] }
        ],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        const restaurantsResult =
          restaurants.map(restaurant => {
            const { Category, ...data } = restaurant
            data.categoryName = Category.name
            return data
          })
        return res.render('feeds', {
          restaurants: restaurantsResult,
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
