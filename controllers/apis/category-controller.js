const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postCategory: (req, res, next) => {
    categoryServices.postCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putCategory: (req, res, next) => {
    categoryServices.putCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteCategory: (req, res, next) => {
    categoryServices.deleteCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = categoryController
