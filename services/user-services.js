const bcrypt = require('bcryptjs')
const { User, Restaurant, Comment, Favorite, Like, Followship } = require('../models')
const { getUser } = require('../helpers/auth-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userServices = {
  // POST signUp
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
      .then(user => {
        const { password, ...data } = user.toJSON()
        cb(null, data)
      })
      .catch(err => cb(err))
  },
  // GET users/:id/favorite
  getUserFavoritedRestaurants: (req, cb) => {
    const id = req.params.id
    User.findByPk(id, {
      include: [{
        model: Restaurant,
        as: 'FavoritedRestaurants'
      }]
    })
      .then(user => {
        const result = user.FavoritedRestaurants.map(restaurant => {
          const { Favorite, ...data } = restaurant.toJSON()
          return data
        })
        cb(null, result)
      })
      .catch(err => cb(err))
  },
  // GET users/:id/comment
  getUserCommentedRestaurants: (req, cb) => {
    const id = req.params.id
    User.findByPk(id, {
      include: [{ model: Comment, include: Restaurant }]
    })
      .then(user => {
        const result = user.Comments.map(comment => {
          const { Restaurant, ...data } = comment.toJSON()
          data.restaurantName = Restaurant.name
          return data
        })
        cb(null, result)
      })
      .catch(err => cb(err))
  },
  // GET users/:id/following
  getUserFollowings: (req, cb) => {
    const id = req.params.id
    User.findByPk(id, {
      include: [{ model: User, as: 'Followings' }]
    })
      .then(user => {
        const result = user.Followings.map(following => {
          const { Followship, ...data } = following.toJSON()
          return data
        })
        cb(null, result)
      })
      .catch(err => cb(null, err))
  },
  // GET users/:id/follower
  getUserFollowers: (req, cb) => {
    const id = req.params.id
    User.findByPk(id, {
      include: [{ model: User, as: 'Followers' }]
    })
      .then(user => {
        const result = user.Followers.map(follower => {
          const { Followship, ...data } = follower.toJSON()
          return data
        })
        cb(null, result)
      })
      .catch(err => cb(null, err))
  },
  // GET users/:id
  getUser: (req, cb) => {
    const reqUser = getUser(req)
    const id = Number(req.params.id)
    return Promise.all([
      User.findByPk(id, (
        { attributes: { exclude: ['password'] } },
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
  // PUT users/:id
  putUser: (req, cb) => {
    const userId = getUser(req).id
    const id = req.params.id
    const { name } = req.body
    const { file } = req
    return Promise.all([
      User.findByPk(id, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
      }),
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
      .then(user => {
        cb(null, {
          status: 'success',
          message: '成功修改個人資料',
          user
        })
      })
      .catch(err => cb(err))
  },
  // POST favorite/:restaurantId
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
      .then(restaurant => cb(null, {
        status: 'success',
        message: '成功新增收藏餐廳',
        restaurant
      }))
      .catch(err => cb(err))
  },
  // DELETE favorite/:restaurantId
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
      .then(restaurant => cb(null, {
        status: 'success',
        message: '成功移除收藏餐廳',
        restaurant
      }))
      .catch(err => cb(err))
  },
  // POST like/:restaurantId
  addLike: (req, cb) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    return Like.findOrCreate({ where: { userId, restaurantId } })
      .then(like => cb(null, {
        status: 'success',
        message: '成功新增喜歡餐廳',
        like
      }))
      .catch(err => cb(err))
  },
  // DELETE like/:restaurantId
  removeLike: (req, cb) => {
    return Like.destroy({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error("You haven't liked this restaurant")
        cb(null, {
          status: 'success',
          message: '成功移除喜歡餐廳',
          like
        })
      })
      .catch(err => cb(err))
  },
  // GET users/top
  getTopUsers: (req, cb) => {
    const reqUserId = getUser(req).id
    return User.findAll({
      include: [{ model: User, as: 'Followers' }],
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    })
      .then(users => {
        const result = users
          .map(user => {
            const { Followers, ...data } = user.toJSON()
            data.followerCount = user.Followers.length
            data.isFollowed = req.user.Followings.some(f => f.id === user.id)
            return data
          })
          .sort((a, b) => b.followerCount - a.followerCount)
        cb(null, { users: result, reqUserId })
      })
      .catch(err => cb(err))
  },
  // POST following/:userId
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
      .then(follow => cb(null, {
        status: 'success',
        message: '成功新增追蹤使用者',
        follow
      }))
      .catch(err => cb(err))
  },
  // DELETE following/:userId
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
      .then(follow => cb(null, {
        status: 'success',
        message: '成功移除追蹤使用者',
        follow
      }))
      .catch(err => cb(err))
  }
}
module.exports = userServices
