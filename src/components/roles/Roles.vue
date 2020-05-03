<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              class="vcenter"
              :class="['bdbottom', i1===0 ? 'bdtop':'']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="delId(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  class="vcenter"
                  :class="i2 ===0 ? '': 'bdtop'"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="delId(scope.row,item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      @close="delId(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre> {{scope.row}} </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="分配权限" :visible.sync="dialogVisible" width="50%" @close="getDefkeys">
        <span>
          <el-tree
            :data="rightList"
            show-checkbox
            node-key="id"
            default-expand-all
            :props="defaultProps"
            :default-checked-keys="defkeys"
            ref="treeRef"
          ></el-tree>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      // 分配权限显示和隐藏
      dialogVisible: false,
      rightList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中节点的id值数组
      defkeys: [],
      roleId: ''
    }
  },
  created() {
    //   角色列表数据
    this.getRolesList()
  },
  methods: {
    getRolesList() {
      // 获取角色列表
      this.$http
        .get('roles')
        .then(result => {
          if (result.data.meta.status !== 200)
            return this.$message.error(result.data.meta.msg)
          this.rolesList = result.data.data
          console.log(this.rolesList)
        })
        .catch(err => {
          this.$message.console.error('接口请求失败')
        })
    },
    delId(role, id1) {
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$http
            .delete(`roles/${role.id}/rights/${id1}`)
            .then(res => {
              console.log(res)
              this.$message.success('删除成功')
              role.children = res.data.data
            })
            .catch(() => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {
          this.$message.info('取消删除')
        })
    },

    // 展开分配权限
    async showDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightList = res.data
      // 递归获取三级节点id
      this.getleafkeys(role, this.defkeys)
      this.dialogVisible = true
    },

    // 通过递归获取的形式，获取角色所有三级权限id,并保存在数组中 defkeys
    getleafkeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) return arr.push(node.id)

      node.children.forEach(item => {
        this.getleafkeys(item, arr)
      })
    },
    // 监听关闭dialog
    getDefkeys() {
      this.defkeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.dialogVisible = false
      console.log(key)
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>