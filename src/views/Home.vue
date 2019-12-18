<template>
  <el-card class="filter-container" shadow="never">
    <el-card v-for="(obj,index) in list" :key="index" class="mt10">
      <div>
        <div class="bg-gray c-flex c-a-c">
          <div class="mr20">规格名：</div>
          <el-input
            size="mini"
            style="width:210px"
            :maxlength="20"
            clearable
            placeholder="请填写规格名称"
            v-model.trim="obj.name"
            @keyup.enter.native="handleCustomSpec(index)"
            @blur="handleCustomSpec(index)"
          ></el-input>
          <el-button size="mini" class="ml10" type="danger" @click="deleteSpec(index)">删除</el-button>
        </div>
        <div>
          <el-tag
            class="mr5 mt10"
            v-for="(tag,tagIndex) in obj.values"
            :key="tagIndex"
            closable
            :disable-transitions="false"
            @close="handleClose(index,tagIndex)"
          >{{tag.name}}</el-tag>
          <el-input
            class="input-new-tag"
            v-model="obj.inputValue"
            placeholder="请填写规格值"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm(index)"
            @blur="handleInputConfirm(index)"
          ></el-input>
        </div>
      </div>
    </el-card>
    <div class="mt10">
      <el-button size="mini" @click="addCustomSpec">添加规格</el-button>
    </div>

    <div class="mt10">
      <div>
        <el-button type="primary" @click="full" size="mini">批量填充</el-button>
      </div>
      <div class="c-flex batch-box mt10">
        <div class="c-box-flex p10" v-for="(sku,i) in skusData" :key="i">
          <el-select v-model="batchSet[sku[0].specId]" size="mini" placeholder="请选择" style="width:'100%">
            <el-option label="全部" value="all"></el-option>
            <el-option
              v-for="(item,$index) in sku"
              :key="$index"
              :label="item.specValName"
              :value="item.specValId"
            ></el-option>
          </el-select>
        </div>
        <div class="c-box-flex p10">
          <el-input v-model="batchSet.costPriceInYuan" size="mini" placeholder="请输入成本价"></el-input>
        </div>
        <div class="c-box-flex p10">
          <el-input v-model="batchSet.priceInYuan" size="mini" placeholder="请输入售价"></el-input>
        </div>
        <div class="c-box-flex p10">
          <el-input v-model="batchSet.skuQuantity" size="mini" placeholder="请输入库存"></el-input>
        </div>
        <div class="special-item p10">
          <el-input v-model="batchSet.outSkuSn" size="mini" placeholder="请输入供应商SKU编码"></el-input>
        </div>
      </div>
      <el-table :data="data" style="width: 100%" size="mini" max-height="500" border>
        <template v-for="(columns,index) in columns">
          <el-table-column
            v-if="customColumnsKey.indexOf(columns.key)===-1"
            :formatter="columns.formatter"
            :prop="columns.key"
            :label="columns.title"
            :key="index"
          ></el-table-column>
          <el-table-column
            v-else
            :prop="columns.key"
            :label="columns.title"
            :key="index"
            :width="columns.width"
          >
            <template slot-scope="scope">
              <el-input size="mini" v-model="scope.row[columns.key]"></el-input>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
  </el-card>
</template>
<script>
import { descartes, diffArary, createUniqueString } from "@/utils/fn";

export default {
  name: "home",
  data() {
    return {
      list: [
        {
          name: "颜色",
          id: createUniqueString(),
          inputValue: null,
          values: [
            {
              id: createUniqueString(),
              name: "红色"
            },
            {
              id: createUniqueString(),
              name: "白色"
            },
            {
              id: createUniqueString(),
              name: "黄色"
            }
          ]
        },
        {
          name: "尺寸",
          id: createUniqueString(),
          inputValue: null,
          values: [
            {
              id: createUniqueString(),
              name: "S"
            },
            {
              id: createUniqueString(),
              name: "M"
            },
            {
              id: createUniqueString(),
              name: "L"
            }
          ]
        }
      ], //规格列表
      skusData: [], // sku数据
      data: null,
      customColumnsKey: [
        "costPriceInYuan",
        "priceInYuan",
        "skuQuantity",
        "outSkuSn"
      ],
      batchSet: {
        costPriceInYuan: null, // 成本价
        priceInYuan: null, // 售价
        skuQuantity: null, // 库存
        outSkuSn: null // 供应SKU商编码
      }
    };
  },
  watch: {
    skusList: {
      deep: true,
      immediate: true,
      handler(newSkus, oldSkus) {
        if (!newSkus.length) return (this.data = []);
        if (!oldSkus || !oldSkus.length) return this.initData(newSkus);
        if (newSkus.length === oldSkus.length) {
          // 当规格名和规格值数量未发生变化，更新 skus 即可
          return (this.data = newSkus.map((item, index) => {
            return {
              ...this.data[index],
              ...item
            };
          }));
        }

        // 当规格名的数量发生了变化
        if (newSkus[0].skus.length !== oldSkus[0].skus.length) {
          return this.initData(newSkus);
        }

        const diffIds = this.diffIds(newSkus, oldSkus);
        if (newSkus.length > oldSkus.length) {
          // 当添加了规格值
          const data = [];
          newSkus.forEach(item => {
            const sku = this.data.find(_item => _item.ids === item.ids);
            if (sku) {
              data.push(sku);
            } else {
              data.push({
                ...item,
                costPriceInYuan: null,
                priceInYuan: null,
                skuQuantity: null,
                outSkuSn: null
              });
            }
          });
          this.data = data;
        } else {
          // 当删除了规格值
          this.data = this.data.filter(_item => !diffIds.includes(_item.ids));
        }
      }
    }
  },
  components: {},
  computed: {
    skusList() {
      const skusData = descartes(this.skusData).map(obj => ({
        skus: obj
      }));
      return skusData.map(item => ({
        skus: item.skus,
        ids: item.skus.reduce(
          (total, prev, index) =>
            `${total}${prev.specId}-${prev.specValId}${
              index === item.skus.length - 1 ? "" : "-"
            }`,
          ""
        )
      }));
    },
    columns() {
      const specList = this.skusData.map(item => ({
        title: item[0] && item[0].specName,
        specId: item[0] && item[0].specId,
        formatter(row) {
          const sku = row.skus.find(
            obj => obj.specId === (item[0] && item[0].specId)
          );
          return sku.specValName;
        }
      }));
      return [
        ...specList,
        {
          title: "成本价(元)",
          key: "costPriceInYuan"
        },
        {
          title: "售价(元)",
          key: "priceInYuan"
        },
        {
          title: "库存(件)",
          key: "skuQuantity"
        },
        {
          title: "商品编码",
          key: "outSkuSn"
        }
      ];
    }
  },
  mounted() {
    this.updateSkuData();
  },
  methods: {
    // 添加规格
    addCustomSpec() {
      this.list.push({
        name: null,
        id: createUniqueString(),
        values: []
      });
      this.updateSkuData();
    },

    //删除规格
    deleteSpec(index) {
      this.list.splice(index, 1);
      this.updateSkuData();
    },
    //添加规格名称
    handleCustomSpec(index) {},
    //添加规格值
    handleInputConfirm(index) {
      const spec = this.list[index];
      const { inputValue, values } = spec;
      if (inputValue) {
        values.push({
          id: createUniqueString(),
          name: inputValue
        });
        spec.inputValue = null;
      }
      this.updateSkuData();
    },
    //删除规格值
    handleClose(index, tagIndex) {
      const { values } = this.list[index];
      values.splice(tagIndex, 1);
      this.updateSkuData();
    },
    // 批量填充
    full() {
      const { data, batchSet } = this;
      const ids = [];
      for (const i in batchSet) {
        if (this.customColumnsKey.indexOf(i) === -1) {
          if (batchSet[i] !== "all") {
            ids.push(i);
            ids.push(`${batchSet[i]}`);
          }
        }
      }
      data.map(obj => {
        if (ids.every(item => obj.ids.indexOf(item) !== -1)) {
          if (this.batchSet.costPriceInYuan) {
            obj.costPriceInYuan = this.batchSet.costPriceInYuan;
          }
          if (this.batchSet.outSkuSn) {
            obj.outSkuSn = this.batchSet.outSkuSn;
          }
          if (this.batchSet.priceInYuan) {
            obj.priceInYuan = this.batchSet.priceInYuan;
          }
          if (this.batchSet.skuQuantity) {
            obj.skuQuantity = this.batchSet.skuQuantity;
          }
        }
        return obj;
      });
    },
    // 更新skuData
    updateSkuData() {
      const specSkuList = [];
      if (this.list.length) {
        this.list.forEach(obj => {
          if (obj.values.length) {
            const checkList = obj.values.map(item => ({
              specId: obj.id,
              specName: obj.name,
              specValId: item.id,
              specValName: item.name
            }));
            specSkuList.push(checkList);
          }
        });
      }
      this.skusData = specSkuList;
    },
    initData(skusList) {
      const { first, data } = this;
      this.data = skusList.map((item, index) => ({
        ...item,
        // 初始化属性
        costPriceInYuan: null,
        priceInYuan: null,
        skuQuantity: null,
        outSkuSn: null
      }));
      this.first = false;
    },
    diffIds(skusList1, skusList2) {
      // 两个数据的 ids 进行相差
      skusList1 = skusList1.map(item => item.ids);
      skusList2 = skusList2.map(item => item.ids);
      return diffArary(skusList1, skusList2);
    }
  }
};
</script>

<style lang="less" scoped>
.bg-gray {
  background: #f8f8f8;
  color: #666;
  font-size: 12px;
  padding: 5px 10px;
}
.batch-box {
  border: 1px solid #ddd;
  border-bottom: none;
  background: #ebeef5;
  .special-item {
    width: 180px;
  }
  .p10 {
    padding: 10px;
  }
}

.c-flex {
  display: flex;
}

.c-box-flex {
  flex: 1;
  display: block;
}

.c-a-c {
  align-items: center; //上下居中
}

.c-j-c {
  justify-content: center; //左右居中
}

.c-aj-c {
  align-items: center;
  justify-content: center;
}

.p10 {
  padding: 0 10px;
}

.mt10 {
  margin-top: 10px;
}
.mr5 {
  margin-right: 5px;
}

.input-new-tag {
  width: 220px;
}
.ml10 {
  margin-left: 10px;
}
</style>
