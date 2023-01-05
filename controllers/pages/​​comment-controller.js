const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'comment was successfully to created')
      res.redirect(`/restaurants/${data.comment.restaurantId}`)
    })
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'comment was successfully to deleted')
      res.redirect(`/restaurants/${data.comment.restaurantId}`)
    })
  },
  editComment: (req, res, next) => {
    commentServices.editComment(req, (err, data) => {
      if (err) return next(err)
      res.render('edit-comment', data)
    })
  },
  putComment: (req, res, next) => {
    commentServices.putComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'comment was successfully to update')
      res.redirect(`/restaurants/${data.comment.restaurantId}`)
    })
  }
}
module.exports = commentController
