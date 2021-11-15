function getCount(arr, rank, ranktype) {
  var obj = {},
    k,
    arr1 = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    k = arr[i];
    if (obj[k]) obj[k]++;
    else obj[k] = 1;
  }
  //保存结果{el-'元素'，count-出现次数}
  for (var o in obj) {
    arr1.push({ el: o, count: obj[o] });
  }
  //排序（降序）
  arr1.sort(function (n1, n2) {
    return n2.count - n1.count;
  });
  //如果ranktype为1，则为升序，反转数组
  if (ranktype === 1) {
    arr1 = arr1.reverse();
  }
  var rank1 = rank || arr1.length;
  return arr1.slice(0, rank1);
}

function getBirthDay(age) {

  // 转换为数字
  var subYear = parseInt(age.substring(age.indexOf("岁") - 1));
  var subMonth = parseInt(age.substring(age.indexOf("月") - 1));
  var subDay = parseInt(age.substring(age.indexOf("天") - 1));

  var now = new Date();
  var nowYear = now.getFullYear();
  var nowMonth = now.getMonth() + 1;
  var nowDay = now.getDate();
  // 按照减法原理，先day相减，不够向month借；然后month相减，不够向year借；最后year相减。
  var day = nowDay - subDay;
  var month = nowMonth - subMonth;
  var year = nowYear - subYear;
  // 检查是否溢出
  if (day < 0) {
    // 获得上月的天数
    var lastMonth = nowMonth - 1;
    var lastMonthOfYear = nowYear;
    if (lastMonth < 0) {
      lastMonth = (lastMonth + 12) % 12;
      lastMonthOfYear = lastMonthOfYear - 1;
    }
    day = day + new Date(lastMonthOfYear, lastMonth, 0).getDate();
    month = month - 1;
  }
  if (month < 0) {
    month = (month + 12) % 12;
    year--;
  }
  return year+'-'+(month<10?"0"+month:month)+'-'+day
}
function getAge(birthday) {
  // 新建日期对象
  let date = new Date();
  // 今天日期，数组，同 birthday
  let today = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  // 分别计算年月日差值
  let age = today.map((value, index) => {
    return value - birthday[index];
  });
  // 当天数为负数时，月减 1，天数加上月总天数
  if (age[2] < 0) {
    // 简单获取上个月总天数的方法，不会错
    let lastMonth = new Date(today[0], today[1], 0);
    age[1]--;
    age[2] += lastMonth.getDate();
  }
  // 当月数为负数时，年减 1，月数加上 12
  if (age[1] < 0) {
    age[0]--;
    age[1] += 12;
  }
  return age;
}
function compareTime(date1, date2, date3) {
  
  var oDate1 = new Date(date1);
  var oDate2 = new Date(date2);
  var oDate3 = new Date(date3);
 
  if (
    oDate3.getTime() > oDate1.getTime() &&
    oDate3.getTime() <= oDate2.getTime()
  ) {
    
    return true;
  } else {
    return false;
  }
}
module.exports = {
  getCount,
  getAge,
  getBirthDay,
  compareTime,
};
