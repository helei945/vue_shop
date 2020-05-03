<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>

      <el-form :model="form" :rules="rules" ref="form" label-width="0" class="login_from">
        <el-form-item prop="username">
          <el-input autocomplete="off" v-model="form.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            autocomplete="off"
            show-password
            v-model="form.password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>

        <el-form-item class="btns">
          <el-button type="primary" @click="onSubmit">登录</el-button>
          <el-button type="info" @click="reset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$http
            .post('/login', {
              username: this.form.username,
              password: this.form.password
            })
            .then(data => {
              //  判断状态码
              let res = data.data
              if (res.meta.status == 200) {
                this.$message.success('登录成功')
                window.sessionStorage.setItem('token', res.data.token)
                this.$router.push('/home')
              } else {
                this.$message.error('登录失败')
              }
            })
            .catch(error => {
              this.$message.error('调用接口失败')
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    reset(form) {
      // 重置
      this.$refs[form].resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background: #2b4b6b;
  height: 100%;

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #ffffff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #dddddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #ffffff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eeeeee;
      }
    }
  }
}

.login_from {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>