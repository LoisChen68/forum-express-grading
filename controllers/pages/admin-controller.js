const adminServices = require('../../services/admin-services')
const { Restaurant, Category } = require('../../models')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', { restaurants: data }))
  },
  postRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, err => {
      if (err) return next(err)
      req.flash('success_messages', 'restaurant was successfully created')
      return res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, err => {
      if (err) return next(err)
      return res.redirect('/admin/restaurants')
    })
  },
  createRestaurant: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    adminServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('admin/restaurant', data))
  },
  editRestaurant: (req, res, next) => {
    return Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    adminServices.putRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'restaurant was successfully to update')
      return res.redirect(`/admin/restaurants/${data.restaurant.id}`)
    })
  },
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) => err ? next(err) : res.render('admin/users', { users: data }))
  },
  patchUser: (req, res, next) => {
    adminServices.patchUser(req, (err, data) => {
      if (err) return next(err)
      if (data.email === 'root@example.com') {
        req.flash('error_messages', '禁止變更 root 權限')
        return
      } else {
        req.flash('success_messages', '使用者權限變更成功')
      }
      return res.redirect('/admin/users')
    })
  }
}
module.exports = adminController
