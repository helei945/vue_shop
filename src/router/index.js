import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

import Roles from '../components/roles/Roles.vue'
import Rights from '../components/rights/Rights.vue'
import Reports from '../components/reports/Reports.vue'
import Params from '../components/params/Params.vue'
import Orders from '../components/orders/Orders.vue'
import Goods from '../components/goods/Goods.vue'
import Categories from '../components/categories/Categories.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', redirect: '/login'
  },
  {
    path: '/login', component: Login
  },
  {
    path: '/home', component: Home, redirect: '/Welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/reports', component: Reports },
      { path: '/params', component: Params },
      { path: '/orders', component: Orders },
      { path: '/goods', component: Goods },
      { path: '/categories', component: Categories }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从那个路径跳转而来
  // next 表示直接放行
  if (to.path === '/login') return next();
  let session = window.sessionStorage.getItem('token');
  if (!session) return next('/login')
  next()

})

export default router
