const { User } = require('../../models')
const { getUser } = require('../../helpers/auth-helpers')
const userServices = require('../../services/user-services')
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功註冊帳號！')
      req.session.createdData = data
      res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => {
      if (err) return next(err)
      res.render('users/profile', data)
    })
  },
  editUser: (req, res, next) => {
    const userId = getUser(req).id
    const id = Number(req.params.id)
    if (userId !== id) {
      req.flash('error_messages', '不具有權限！')
      res.redirect(`/users/${userId}/edit`)
    }
    return User.findByPk(id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${data.id}`)
    })
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  addLike: (req, res, next) => {
    userServices.addLike(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  removeLike: (req, res, next) => {
    userServices.removeLike(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  getTopUsers: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) => {
      if (err) return next(err)
      res.render('top-users', data)
    })
  },
  addFollowing: (req, res, next) => {
    userServices.addFollowing(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  removeFollowing: (req, res, next) => {
    userServices.removeFollowing(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  }
}
module.exports = userController
