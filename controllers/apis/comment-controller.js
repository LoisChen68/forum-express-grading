const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putComment: (req, res, next) => {
    commentServices.putComment(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  // 取得單筆留言
  editComment: (req, res, next) => {
    commentServices.editComment(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = commentController
