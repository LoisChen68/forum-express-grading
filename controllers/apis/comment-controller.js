const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => err ? next(err) : res.json(data))
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => err ? next(err) : res.json(data))
  },
  putComment: (req, res, next) => {
    commentServices.putComment(req, (err, data) => err ? next(err) : res.json(data))
  },
  // 取得單筆留言
  editComment: (req, res, next) => {
    commentServices.editComment(req, (err, data) => err ? next(err) : res.json(data))
  },
  getCommentFeeds: (req, res, next) => {
    commentServices.getCommentFeeds(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = commentController
