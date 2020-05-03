<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            clearable
            @clear="getUserList"
            v-model="queryInfo.query"
            placeholder="请输入内容"
            class="input-with-select"
          >
            <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="add">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              @change="userStateChanged(scope.row)"
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="editUser(scope.row)" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="del(scope.row)" size="mini"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                @click="setRole(scope.row)"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog :title="title" width="50%" :visible.sync="dialogVisible" @close="addDialogClosed">
      <span>
        <el-form :model="addForm" :rules="rules" ref="ruleForm" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input :disabled="isDisabled" v-model="addForm.username"></el-input>
          </el-form-item>

          <el-form-item v-if="activePd" label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>

          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser(title)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog title="分配角色" :visible.sync="setdialogVisible" width="50%">
      <div>
        <p>当前的用户：{{userinfoRole.username}}</p>
        <p>当前的角色：{{userinfoRole.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectValue" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 自定义校验规则
    // 验证邮箱规则
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        cb()
      } else {
        cb(new Error('请输入合法的邮箱'))
      }
    }
    // 验证手机规则
    let checkMobile = (rule, value, cb) => {
      const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (reg.test(value)) {
        cb()
      } else {
        cb(new Error('手机号码格式不正确'))
      }
    }

    return {
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      userList: [],
      total: 0,
      //控制对话框显示与隐藏
      dialogVisible: false,
      setdialogVisible: false,
      //   添加用户表单数据
      addForm: {},
      // 对话框密码显示隐藏
      activePd: true,
      // 对话框title显示
      title: '',
      isDisabled: false,
      // 分配用户权限
      userinfoRole: {},
      roleList: [],

      selectValue: '',
      //   添加表单数据验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 13, message: '长度在 6 到 13 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入合法的邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表失败！')
      console.log(res.data)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch 开关改变
    userStateChanged(userinfo) {
      this.$http
        .put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        .then(result => {
          this.$message.success('更新用户状态成功')
        })
        .catch(err => {
          userinfo.mg_state = !userinfo.mg_state
          this.$message.success('更新用户状态失败')
        })
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed(done) {
      this.$refs.ruleForm.resetFields()
    },

    add() {
      this.title = '添加用户'
      this.dialogVisible = true
      this.isDisabled = false
      this.activePd = true
      // this.addForm.username = row.username
      // this.addForm.email = row.email
      // this.addForm.mobile = row.mobile
      this.addForm = {}
    },
    //新增新用户
    addUser(row) {
      if (row == '添加用户') {
        console.log(row)
        this.$refs.ruleForm.validate(async done => {
          if (!done) return
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success('添加用户成功')
          // 关闭对话框
          this.dialogVisible = false
          // 重新获取列表
          this.getUserList()
          return
        })
      } else {
        this.$refs.ruleForm.validate(async vaild => {
          if (!vaild) return
          const { data: res } = await this.$http.put(
            'users/' + this.addForm.id,
            this.addForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success('修改成功')
          // 关闭对话框
          this.dialogVisible = false
          // 重新获取列表
          this.getUserList()
          return
        })
      }
    },
    // 修改
    async editUser(row) {
      this.title = '修改用户'
      this.dialogVisible = true
      this.activePd = false
      this.isDisabled = true
      const { data: res } = await this.$http.get('users/' + row.id)
      if (res.meta.status !== 200) return this.$http.error(res.meta.msg)
      this.addForm = res.data
      console.log(this.addForm)
    },
    // 删除
    del(info) {
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$http
            .delete('users/' + info.id)
            .then(() => {
              this.$message.success('删除成功')
              this.getUserList()
            })
            .catch(() => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {
          this.$message.info('取消删除')
        })
    },

    // 分配角色
    async setRole(info) {
      console.log(info)

      this.userinfoRole = info

      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败')

      this.roleList = res.data
      console.log(res)

      this.setdialogVisible = true
    },
    // 修改分配角色
    async saveRoleInfo() {

      if (!this.selectValue) return this.$message.error('请选择要分配的角色！')

      const {data:res} = await this.$http.put(`users/${this.userinfoRole.id}/role`,{
        rid: this.selectValue
      })
      if (res.meta.status !== 200)
        return this.$message.error('更新角色失败')

      this.$message.success('更新角色成功')
      this.getUserList()
      this.setdialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
</style>