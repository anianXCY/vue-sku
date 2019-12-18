/**
 * javascript comment
 * @Author: anian
 * @Date: 2019-12-18 19:09:09
 * @Desc:  一些函数
 */

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function descartes(list) {
  // parent上一级索引;count指针计数
  const point = {};
  const result = [];
  let pIndex = null;
  let tempCount = 0;
  let temp = [];
  // 根据参数列生成指针对象
  for (var index in list) {
    if (typeof list[index] === "object") {
      point[index] = { parent: pIndex, count: 0 };
      pIndex = index;
    }
  }
  // 单维度数据结构直接返回
  if (pIndex == null) {
    return list;
  }
  // 动态生成笛卡尔积
  while (true) {
    for (var index in list) {
      tempCount = point[index].count;
      temp.push(list[index][tempCount]);
    }
    // 压入结果数组
    result.push(temp);
    temp = [];
    // 检查指针最大值问题
    while (true) {
      if (point[index].count + 1 >= list[index].length) {
        point[index].count = 0;
        pIndex = point[index].parent;
        if (pIndex == null) {
          return result;
        }
        // 赋值parent进行再次检查
        index = pIndex;
      } else {
        point[index].count++;
        break;
      }
    }
  }
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr));
}

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Array}
 */
export function diffArary(arr1, arr2) {
  arr1 = uniqueArr(arr1);
  arr2 = uniqueArr(arr2);
  return arr1
    .concat(arr2)
    .filter(arg => !(arr1.includes(arg) && arr2.includes(arg)));
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = `${+new Date()}`;
  const randomNum = `${parseInt((1 + Math.random()) * 65536, 10)}`;
  return (+(randomNum + timestamp)).toString(32);
}
