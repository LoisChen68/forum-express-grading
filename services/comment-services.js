const { Comment, User, Restaurant } = require('../models')
const { getUser } = require('../helpers/auth-helpers')
const commentController = {
  getComments: (req, cb) => {
    const restaurantId = req.params.restaurantId
    Comment.findAll({
      where: { restaurantId }
    })
      .then(comments => cb(null, comments))
      .catch(err => cb(err))
  },
  // POST comment 新增評論
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
  // DELETE comments/:id 刪除評論
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
  // GET comments/:id 取得單則評論
  editComment: (req, cb) => {
    return Comment.findByPk(req.params.id, { raw: true })
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        cb(null, comment)
      })
      .catch(err => cb(err))
  },
  // PUT comments/:id 修改評論
  putComment: (req, cb) => {
    const reqUserId = getUser(req).id
    const { text } = req.body
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        return comment.update({
          text
        })
      })
      .then(comment => {
        if (comment.userId !== reqUserId) throw new Error('不具權限！')
        cb(null, { status: 'success', comment })
      })
      .catch(err => cb(err))
  },
  // GET comments/feeds 取得最新評論 預設10筆
  getCommentFeeds: (req, cb) => {
    const DEFAULT_LIMIT = 10
    const CommentFeedsLimit = Number(req.query.limit) || DEFAULT_LIMIT
    Comment.findAll({
      limit: CommentFeedsLimit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
        },
        { model: Restaurant, attributes: ['name'] }
      ]
    })
      .then(comments => cb(null, comments))
      .catch(err => cb(err))
  }
}
module.exports = commentController
