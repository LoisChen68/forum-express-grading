const bcrypt = require('bcryptjs')
const { User, Restaurant, Comment, Favorite, Like, Followship } = require('../models')
const { getUser } = require('../helpers/auth-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userServices = {
  signUp: (req, cb) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        image: `https://loremflickr.com/320/240/user,icon/?random=${Math.random() * 100}`,
        password: hash
      }))
      .then(newUser => cb(null, { user: newUser }))
      .catch(err => cb(err))
  },
  getUser: (req, cb) => {
    const reqUser = getUser(req)
    const id = Number(req.params.id)
    return Promise.all([
      User.findByPk(id, (
        {
          include:
            [
              { model: User, as: 'Followers' },
              { model: User, as: 'Followings' },
              { model: Restaurant, as: 'FavoritedRestaurants' }
            ]
        }
      )),
      Comment.findAll({
        include: Restaurant,
        where: { userId: id },
        attributes: ['restaurantId'],
        group: 'restaurantId',
        raw: true,
        nest: true
      })
    ])
      .then(([targetUser, comments]) => {
        targetUser = targetUser.toJSON()
        if (!targetUser) throw new Error("User didn't exist!")
        const isFollowed = req.user.Followings.some(f => f.id === targetUser.id)
        cb(null, {
          user: reqUser,
          reqUser,
          targetUser,
          isFollowed,
          comments
        })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const userId = getUser(req).id
    const { name } = req.body
    const { file } = req
    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("user didn't exist!")
        if (user.id !== userId) throw new Error('不具權限！')
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(data => {
        cb(null, data)
      })
      .catch(err => cb(err))
  },
  addFavorite: (req, cb) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => cb(null))
      .catch(err => cb(err))
  },
  removeFavorite: (req, cb) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")

        return favorite.destroy()
      })
      .then(() => cb(null))
      .catch(err => cb(err))
  },
  addLike: (req, cb) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    return Like.findOrCreate({ where: { userId, restaurantId } })
      .then(like => {
        if (like) throw new Error('You have liked this restaurant!')
        cb(null)
      })
      .catch(err => cb(err))
  },
  removeLike: (req, cb) => {
    return Like.destroy({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error("You haven't liked this restaurant")
        cb(null)
      })
      .catch(err => cb(err))
  },
  getTopUsers: (req, cb) => {
    const reqUser = getUser(req)
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        cb(null, { users: result, reqUser })
      })
      .catch(err => cb(err))
  },
  addFollowing: (req, cb) => {
    const reqUserId = getUser(req).id
    const userId = req.params.userId
    Promise.all([
      User.findByPk(userId, {
        raw: true,
        nest: true
      }),
      Followship.findOne({
        where: {
          followerId: reqUserId,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error("User didn't exist!")
        if (user.id === reqUserId) throw new Error("You can't follow yourself")
        if (followship) throw new Error('You are already following this user!')
        if (user.id !== userId) {
          return Followship.create({
            followerId: reqUserId,
            followingId: userId
          })
        }
      })
      .then(() => cb(null))
      .catch(err => cb(err))
  },
  removeFollowing: (req, cb) => {
    Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .then(() => cb(null))
      .catch(err => cb(err))
  }
}
module.exports = userServices
