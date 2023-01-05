const { Category, Restaurant } = require('../models')

const categoryController = {
  // GET admin/categories 取得所有分類
  getCategories: (req, cb) => {
    Category.findAll({ raw: true })

      .then(categories => cb(null, categories))
      .catch(err => cb(err))
  },
  // GET admin/categories/:id 取得單筆分類
  getCategory: (req, cb) => {
    Category.findByPk(req.params.id, { raw: true })
      .then(category => cb(null, category))
      .catch(err => cb(err))
  },
  // POST admin/categories 新增分類
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
  // PUT admin/categories/:id 修改分類
  putCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    Promise.all([
      Category.findOne({
        attributes: ['name'],
        where: { name }
      }),
      Category.findByPk(req.params.id)
    ])
      .then(([oneCategory, category]) => {
        if (oneCategory) throw new Error('Category name is used')
        if (oneCategory) req.flash('error_message', 'Category name is used')
        if (!category) throw new Error("Category doesn't exist!")
        if (category.name === '未分類') throw new Error("The category can't revise!")
        return category.update({ name })
      })
      .then(category => cb(null, {
        status: 'success',
        category
      }))
      .catch(err => cb(err))
  },
  // DELETE admin/categories/:id 刪除分類
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
