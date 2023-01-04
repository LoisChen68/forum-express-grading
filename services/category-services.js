const { Category, Restaurant } = require('../models')

const categoryController = {
  getCategories: (req, cb) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => cb(null, {
        categories,
        category
      }))
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    Category.findOne({
      attributes: ['name'],
      where: { name }
    })
      .then(category => {
        if (!category) return Category.create({ name })
        if (category) throw new Error('Category name is used')
      })
      .then(category => cb(null, {
        status: 'success',
        category
      }))
      .catch(err => cb(err))
  },
  putCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")
        return category.update({ name })
      })
      .then(category => cb(null, {
        status: 'success',
        category
      }))
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    const categoryId = req.params.id
    const unCategoryId = '1'
    Category.findByPk(categoryId)
      .then(async category => {
        if (!category) throw new Error("Category didn't exist!")
        if (category.name === '未分類') throw new Error("The category can't delete!")
        await Restaurant.update(
          { categoryId: unCategoryId },
          { where: { categoryId } })
        return category.destroy()
      })
      .then(deletedCategory => cb(null, {
        status: 'success',
        message: '刪除成功',
        category: deletedCategory
      }))
      .catch(err => cb(err))
  }
}
module.exports = categoryController
