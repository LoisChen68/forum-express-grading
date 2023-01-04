const { Comment, User, Restaurant } = require('../models')
const commentController = {
  postComment: (req, cb) => {
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
      .then(comment => cb(null, { status: 'success', comment }))
      .catch(err => cb(err))
  },
  deleteComment: (req, cb) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!'")
        return comment.destroy()
      })
      .then(deleteComment => cb(null, {
        status: 'success',
        message: '刪除成功',
        comment: deleteComment
      }))
      .catch(err => cb(err))
  },
  editComment: (req, cb) => {
    return Comment.findByPk(req.params.id, { raw: true })
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        cb(null, comment)
      })
      .catch(err => cb(err))
  },
  putComment: (req, cb) => {
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
        cb(null, { status: 'success', comment })
      })
      .catch(err => cb(err))
  }
}
module.exports = commentController
