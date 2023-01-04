const { Restaurant, Category, User, Comment } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const adminServices = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({
      include: [Category]
    })
      .then(restaurants => {
        const result =
          restaurants.map(restaurant => {
            const { Category, ...data } = restaurant.toJSON()
            data.categoryName = Category.name
            return data
          })
        cb(null, { restaurants: result })
      })
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    imgurFileHandler(file)
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      }))
      .then(newRestaurant => cb(null, {
        states: 'success',
        restaurant: newRestaurant
      }))
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    const restaurantId = req.params.id
    Restaurant.findByPk(restaurantId)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }
        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, {
        status: 'success',
        message: '刪除成功',
        restaurant: deletedRestaurant
      }))
      // 刪除關聯的餐廳評論
      .then(() => {
        Comment.destroy({ where: { restaurantId: restaurantId } })
      })
      .catch(err => cb(err))
  },
  createRestaurant: (req, cb) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => cb(null, { categories }))
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        const { Category, ...data } = restaurant
        data.categoryName = Category.name
        cb(null, { restaurant: data })
      })
      .catch(err => cb(err))
  },
  editRestaurant: (req, cb) => {
    return Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        cb(null, { restaurant, categories })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    const restaurantId = req.params.id
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    Promise.all([
      Restaurant.findByPk(restaurantId),
      imgurFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(restaurant => {
        cb(null, { status: 'success', restaurant })
      })
      .catch(err => cb(err))
  },
  getUsers: (req, cb) => {
    return User.findAll({ raw: true })

      .then(users =>
        cb(null, { users }))

      .catch(err => cb(err))
  },
  patchUser: (req, cb) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        if (user.email === 'root@example.com') throw new Error('禁止變更 root 權限')
        const res = user.isAdmin
        user.update({ isAdmin: !user.isAdmin })
        return res
      })
      .then(res => {
        if (res) {
          cb(null, { status: 'success', message: '權限變更為admin' })
        } else {
          cb(null, { status: 'success', message: '權限變更為user' })
        }
      })
      .catch(err => cb(err))
  }
}
module.exports = adminServices
