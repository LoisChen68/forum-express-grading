const { Comment, User, Restaurant } = require('../../models')
const commentController = {
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required!')
    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error("User didn't exist!")
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return Comment.create({
          text,
          restaurantId,
          userId
        })
      })
      .then(() => {
        res.redirect(`/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  },
  deleteComment: (req, res, next) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!'")
        return comment.destroy()
      })
      .then(deletedComment => res.redirect(`/restaurants/${deletedComment.restaurantId}`))
      .catch(err => next(err))
  },
  editComment: (req, res, next) => {
    return Comment.findByPk(req.params.id, { raw: true })
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        res.render('edit-comment', comment)
      })
      .catch(err => next(err))
  },
  putComment: (req, res, next) => {
    const { text } = req.body
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        return comment.update({
          text
        })
      })
      .then(comment => {
        req.flash('success_messages', 'comment was successfully to update')
        res.redirect(`/restaurants/${comment.restaurantId}`)
      })
      .catch(err => next(err))
  }
}
module.exports = commentController
