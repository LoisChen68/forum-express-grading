# 餐廳論壇

### 介紹
這是一個使用 Node.js 及 Express 並使用 Handlebars 製作全端網頁，另外將共用邏輯拉至 services 開發 API 供外部使用。

### [API Doc](https://www.notion.so/API-389a98b9bfa749f69df76b192afb8c83)

## 使用者故事
### 前台
- 使用者可以註冊/登入/登出網站
- 使用者可以在瀏覽所有餐廳與個別餐廳詳細資料
- 在瀏覽所有餐廳資料時，可以用分類篩選餐廳
- 使用者可以對餐廳留下評論
- 使用者可以收藏餐廳
- 使用者可以查看最新上架的 10 筆餐廳
- 使用者可以查看最新的 10 筆評論
- 使用者可以編輯自己的個人資料
- 使用者可以查看自己評論過、收藏過的餐廳
- 使用者可以追蹤其他的使用者
- 使用者可以查看自己追蹤中的使用者與正在追蹤自己的使用者 

### 後台
- 只有網站管理者可以登入網站後台
- 網站管理者可以在後台管理餐廳的基本資料
- 網站管理者可以在後台管理餐廳分類
- 網站管理者可以在後台管理使用者的權限

### install
- clone 此專案
```
git clone https://github.com/LoisChen68/forum-express-grading.git
```

- 安裝 package
```
npm install
```

- 至 `/config/config.json` 設定資料庫
``` javascript
  "development": {
    "username": "username",
    "password": "password",
    "database": "database",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
```

- 建立資料庫
```
npx sequelize db:migrate
```

- 建立種子資料
```
npx sequelize db:seed:all
```

- 啟動伺服器
```
npm run dev
```
- 會在終端機看到
```
Example app listening on port ${port}!
```
代表成功啟動伺服器

### 測試帳號
- 具有 Admin 權限
```
帳號： root@example.com
密碼： 12345678
```

- 不具有 Admin 權限
```
帳號： user1@example.com
密碼： 12345678
```
