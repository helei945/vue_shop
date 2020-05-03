<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="sogger-button" @click="soggerButton">
          <i :class="isCollapse ? 'el-icon-right' : 'el-icon-back'"></i>
        </div>
        <el-menu
          router
          unique-opened
          :collapse-transition="false"
          :collapse="isCollapse"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          :default-active="activePath"
        >
          <el-submenu :index="item.id + ''" v-for="(item,index) in menuList" :key="item.id">
            <template slot="title">
              <i class="iconfont" :class="icon[index]"></i>
              <span>{{item.authName}}</span>
            </template>

            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      icon: [
        'icon-users',
        'icon-tijikongjian',
        'icon-shangpin',
        'icon-danju',
        'icon-baobiao'
      ],
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    console.log(this.$route)
    this.activePath = this.$route.path
  },
  updated() {
    this.activePath = this.$route.path
  },
  methods: {
    loginOut() {
      this.$confirm('是否退出登录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '退出成功!'
          })
          window.sessionStorage.clear()
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '再看看'
          })
        })
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    soggerButton() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(state) {
      this.activePath = state
    }
  },

  onLoad() {
    console.log(this.state)
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  font-size: 20px;
  color: #ffffff;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
  .el-button {
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}

.sogger-button {
  text-align: center;
  padding: 5px;
  background-color: #909399;
  cursor: pointer;
}
</style>