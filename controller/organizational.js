const { exec } = require("../db/mysql");
const xss = require("xss");
const pinyin = require("tiny-pinyin");
const { pageSize } = require("../conf/page");
const strReplace = (str, index, char) => {
  const strAry = str.split("");
  strAry[index] = char;
  return strAry.join("");
};

const getOrganization = async (
 query,
  type,
  name,
  contact_people,
  province,
  city,
  area,
  curPage=1,
  address
) => {
  let sql = `select * from organizational where 1=1 and is_deleted=${0} `;
  if(query){
	sql+=` and (name like '%${name}%' or contact_people like '%${query}%' or code like '%${query}%') `
  }
  if (type) {
    sql += `and type='${type}' `;
  }
  if (address) {
    sql += `and address='${address}' `;
  }
  if (name) {
    sql += `and name='${name}' `;
  }
  if (contact_people) {
    sql += `and contact_people='${contact_people}' `;
  }
  //   todo select by adminCode
  if (province) {
    sql += `and province='${province}' `;
  }
  if (city) {
    sql += `and city='${city}' `;
  }
  if (area) {
    sql += `and area='${area}'`;
  }

  let sql_count = sql.replace("*", "count(*)");
  sql += `limit ${(curPage - 1) * pageSize},${pageSize}`;
  const totalPageNum = await exec(sql_count);
  const res = await exec(sql);
  res.totalPageNum = Math.floor((totalPageNum[0]["count(*)"]+pageSize-1)/pageSize);

  return new Promise((resolve) => {
    resolve(res);
  });
};
const PrefixInteger = (num, length) => {
  return (Array(length).join("0") + num).slice(-length);
};
async function genCode(area, name,isUpdate,id) {
  if (!name || !area) {
    return;
  }
  let code = "";
  const sql = `select count(*) from organizational`;
  let code_data;
  let num
 if(id){
  const sql_sel_code =`select code from organizational where id=${id}`
  code_data = await exec(sql_sel_code);
  num = code_data[0]['code'].charAt(code_data[0]['code'].length-1)
 }
  const data = await exec(sql);
 
  
  if (pinyin.isSupported()) {
    name = pinyin.convertToPinyin(name); // WO
  }
  if(!isUpdate && !id){
    code = area  + PrefixInteger(data[0]["count(*)"] + 1, 6);
  }else{
    code = area  + PrefixInteger(parseInt(num), 6);
  }
  return code;
}
async function createOrganization(data) {
 
  let {
    name,
    contact_people,
    phone,
    type,
    remark,
    lng,
    lat,
    business_license,
    admin_code,
    province,
    city,
    area,
    address
  } = data;
  if(typeof(name)==='undefined' || typeof(contact_people)==='undefined' || typeof(phone)==='undefined' || typeof(type)==='undefined' || typeof(lng)==='undefined' || typeof(lat)==='undefined' || typeof(business_license)==='undefined' || typeof(admin_code)==='undefined' || typeof(province)==='undefined' || typeof(city)==='undefined' || typeof(area)==='undefined' || typeof(address)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
  const code = await genCode(area, name);
  const sql = `insert into organizational(type,name,contact_people,business_license,code,phone,admin_code,lng,lat,remark,province,city,area,address) values(${type},'${name}','${contact_people}','${business_license}','${code}','${phone}','${admin_code}','${lng}','${lat}','${remark}',${province},${city},${area},'${address}')`;
  
  let res = "";
  try {
    res = await exec(sql);
  } catch (err) {
    return {
      msg: err.sqlMessage,
    };
  }
  return {
    id: res.insertId,
  };
}
async function updateOrganization(data){
  let {
    name,
    contact_people,
    phone,
    type,
    remark,
    lng,
    lat,
    business_license,
    admin_code,
    province,
    city,
    area,
    id,
    address
  } = data;
  if(typeof(id)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
  let sql = `update organizational set `;

  if (name&&!area) {
    let sql_sel_area = `select area from organizational where id=${id}`;
    let area = await exec(sql_sel_area);
    let code = await genCode(area[0]['area'], name,true,id);
    sql += `name='${name}',code='${code}',`;
  }
  if (contact_people) {
    sql += `contact_people='${contact_people}',`;
  }
  if (phone) {
    sql += `phone='${phone}',`;
  }
  if (address) {
    sql += `address='${address}',`;
  }
  if (type) {
    sql += `type='${type}',`;
  }
  if (remark) {
    sql += `remark='${remark}',`;
  }
  if (lng) {
    sql += `lng='${lng}',`;
  }
  if (lat) {
    sql += `lat='${lat}',`;
  }
  if (business_license) {
    sql += `business_license='${business_license}',`;
  }
  if (admin_code) {
    sql += `admin_code=${admin_code},`;
  }
  if (province) {
    sql += `province=${province},`;
  }
  if (city) {
    sql += `city=${city},`;
  }
  if (area&&!name) {
    let sql_sel_name = `select name from organizational where id=${id}`;
    let name = await exec(sql_sel_name);
    let code = await genCode(area, name[0]['name'],true,id);
    sql += `area=${area},code='${code}',`;
  }
  if(area&&name){
    let code = await genCode(area, name,true,id);
    sql += `name='${name}',area=${area},code='${code}',`;
  }
  if(id){
    sql += `where id=${id} and is_deleted=${0}`;
  }
  sql = strReplace(sql, sql.indexOf("where") - 1, " ");
  return exec(sql).then((res) => {
    if (res.affectedRows > 0) {
      return true;
    }
    return false;
  }).catch(err=>{
    return {
      msg: err.sqlMessage,
    };
  });
};
function arrDistinctByProp(arr,prop){
            let obj = {};
            return arr.reduce(function(preValue,item){
                obj[item[prop]] ? '' : obj[item[prop]] = true && preValue.push(item);
                return preValue
            },[])
}






const getUnqualifiedStudentsHistory= async (data)=>{
	
  
	
  let sql = `select organizational.id as organizational_id,organizational.name as organizational_name,organizational.province as organizational_province,organizational.city as organizational_city,organizational.area as organizational_area,student.id as student_id, student.name as student_name, student.birth as student_birth,student.class_no as student_class,student.remark as student_remark,student.address as student_address  from organizational 
  left join teacher on organizational.id = teacher.organizational_id 
  left join class on teacher.id=class.teacher_id 
  left join student on class.id=student.class_id
  left join score_record on score_record.studentId = student.id where score_record.is_up_to_standard=${0} and (length(score_record.analysis)>0  or score_record.is_read = ${1})
 `
 
 
 
 
 //获取
 //select * from (select organizational.id as organizational_id,organizational.name as organizational_name,organizational.province as organizational_province,organizational.city as organizational_city,organizational.area as organizational_area,student.id as student_id, student.name as student_name, student.birth as student_birth,student.class_no as student_class,student.remark as student_remark,student.address as student_address,score_record.is_up_to_standard as is_up_to_standard,score_record.relation_id as relation_id, sum(score_record.is_up_to_standard) as sum_is_up_to_standard from organizational left join teacher on organizational.id = teacher.organizational_id left join class on teacher.id=class.teacher_id left join student on class.id=student.class_id left join score_record on score_record.studentId = student.id where length(score_record.analysis)=0 group by student_id,relation_id order by score_record.insert_time) t order by student_id
 
  
 
 
  let res = arrDistinctByProp(await exec(sql),'student_id')
 
 

 
  let ids = [];
  let score_res=[];
  res.map(item=>ids.push(item.student_id))
  
  for(let index in ids){
	  let sql_score =`select * from score_record where studentId=${ids[index]}  and is_deleted=${0} and length(analysis)>0  and is_up_to_standard=${0}`;
	  
      score_res.push(await exec(sql_score))
	   
  }
  
   res.map((item,index)=>{
		item.StudentScores = score_res[index]
	})
	  
  return new Promise(resolve=>{
	  resolve(res)
  });
  
}




const getUnqualifiedStudents= async (data)=>{
	
  
	
 /* let sql = `select organizational.id as organizational_id,organizational.name as organizational_name,organizational.province as organizational_province,organizational.city as organizational_city,organizational.area as organizational_area,student.id as student_id, student.name as student_name, student.birth as student_birth,student.class_no as student_class,student.remark as student_remark,student.address as student_address  from organizational 
  left join teacher on organizational.id = teacher.organizational_id 
  left join class on teacher.id=class.teacher_id 
  left join student on class.id=student.class_id
  left join score_record on score_record.studentId = student.id where score_record.is_up_to_standard=${0} and length(score_record.analysis)=0

 `
 
 
 
 
 //获取
 //select * from (select organizational.id as organizational_id,organizational.name as organizational_name,organizational.province as organizational_province,organizational.city as organizational_city,organizational.area as organizational_area,student.id as student_id, student.name as student_name, student.birth as student_birth,student.class_no as student_class,student.remark as student_remark,student.address as student_address,score_record.is_up_to_standard as is_up_to_standard,score_record.relation_id as relation_id, sum(score_record.is_up_to_standard) as sum_is_up_to_standard from organizational left join teacher on organizational.id = teacher.organizational_id left join class on teacher.id=class.teacher_id left join student on class.id=student.class_id left join score_record on score_record.studentId = student.id where length(score_record.analysis)=0 group by student_id,relation_id order by score_record.insert_time) t order by student_id
 
  
 
 
 let res = arrDistinctByProp(await exec(sql),'student_id')
 
 

 
  let ids = [];
  let score_res=[];
  res.map(item=>ids.push(item.student_id))
  
  for(let index in ids){
	  let sql_score =`select * from score_record where studentId=${ids[index]}`;
      score_res.push(await exec(sql_score))
	   
  }
    res.map((item,index)=>{
		item.StudentScores = score_res[index]
	})*/
	
	
	let res = []
	let sql = `select * from (select organizational.id as organizational_id,organizational.name as organizational_name,organizational.province as organizational_province,organizational.city as organizational_city,organizational.area as organizational_area,student.id as student_id, student.name as student_name, student.birth as student_birth,student.class_no as student_class,student.remark as student_remark,student.address as student_address,score_record.is_up_to_standard as is_up_to_standard,score_record.relation_id as relation_id, sum(score_record.is_up_to_standard) as sum_is_up_to_standard from organizational left join teacher on organizational.id = teacher.organizational_id left join class on teacher.id=class.teacher_id left join student on class.id=student.class_id left join score_record on score_record.studentId = student.id where organizational.is_deleted=${0}  and organizational.is_deleted=${0} and length(score_record.analysis)=0 group by student_id,relation_id order by score_record.insert_time) t order by student_id`
 
 
  //查询所有学生的所有成绩信息
  let res1 =  await exec(sql);
	
   //console.log(res1.length)
  
  //判断某个学生是否连续三次课未达标
  
  //1.将所有学生的成绩放入各自的数组里面
  var temp_dict = {}
  for(var i =0;i < res1.length;i++){
  
	 if(temp_dict.hasOwnProperty(res1[i].student_id)){
		//console.log(json["key1]);
		temp_dict[res1[i].student_id].push(res1[i]);
	 }else{
		temp_dict[res1[i].student_id] = [];
		temp_dict[res1[i].student_id].push(res1[i]);
	 }
  }
  
  
  
  console.log(temp_dict)
  
  
    //2.判断这个学生是否连续三次不及格
    
    for (var Key in temp_dict){
       let scoreList = temp_dict[Key];
	   if(scoreList.length < 3){
			continue;
	   }else{
			
			let student_temp = 0; 
			for(var j =0;j < scoreList.length;j++){
			
				if(scoreList[j].sum_is_up_to_standard == 0){   //如果未达标开始计数
					student_temp = student_temp + 1;
					if(student_temp >= 3)                      //如果连续三次，就退出循环，认为这个学生连续三次未达标
						break;
				}else{
					student_temp = 0;
				}
				
			}
			if(student_temp >= 3){
				
				res.push(scoreList[0]);
			}	
	   }
    }
	
   //console.log(res)
  
   //查询这个学生所有不及格的数据信息
	for(var j =0;j < res.length;j++){
		
		let sid = res[j].student_id;
		
		
		//let sql_score =`select score_record.* from score_record where studentId=${sid}  and is_deleted=${0} and length(analysis)=0  and   score_record.is_read = ${0}  and is_up_to_standard=${0}`;	
		
		
		let sql_score = `
			select score_record.*
  from score_record 
  left join relationship on score_record.relation_id = relationship.id 
  left join student on score_record.studentId = student.id 
  left join student_work_record on student_work_record.student_id = score_record.studentId
  left join course on course.id = relationship.course_id
  where course.is_deleted=${0} and  score_record.is_up_to_standard=${0}  and LENGTH(score_record.analysis)=0 and  score_record.is_read = ${0} and score_record.is_deleted=${0} and relationship.is_deleted=${0} and student.is_deleted=${0} and score_record.studentId=${sid}
		`
		
		//console.log(sql_score)
		let a = await exec(sql_score);	
		res[j].StudentScores = a;		
	}
  
  
	console.log(res);

  
  return new Promise(resolve=>{
	  resolve(res)
  });
  
}
const getSpecialRecordStudents = ()=>{
  let sql = `select organizational.id as organizational_id,
  organizational.name as organizational_name,
  organizational.province as organizational_province,
  organizational.city as organizational_city,
  organizational.area as organizational_area,
  student.id as student_id, 
  student.name as student_name from organizational 
  left join teacher on organizational.id = teacher.organizational_id 
  left join class on teacher.id=class.teacher_id 
  left join student on class.id=student.class_id 
  where student.id in 
  (select student.id from student 
  left join score_record on student.id = score_record.studentId where score_record.special_record   is not null and LENGTH(trim(score_record.special_record))>0 and LENGTH(score_record.analysis)=0  and score_record.is_deleted=0 and student.is_deleted=0) and organizational.is_deleted=0 and student.is_deleted=0 and teacher.is_deleted=0 and class.is_deleted=0` 
  return exec(sql);
}
const delOrganization = (id) => {
  if(typeof(id)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
  const sql = `update organizational set is_deleted=${1} where id=${id}`;

  return exec(sql).then((res) => {
    if (res.affectedRows > 0) {
      return true;
    }
    return false;
  }).catch(err=>{
    return {
      msg: err.sqlMessage,
    };
  });
};




//通过机构ID查询机构详情
const getOrganizationDetailById =  async (data)=>{
	
	let  sql = `SELECT * FROM organizational WHERE id = ${data.id} and is_deleted = 0`;
	const dataList = await exec(sql);
	
	return   dataList; 
	
}



module.exports = {
  getOrganization,
  createOrganization,
  delOrganization,
  updateOrganization,
  getUnqualifiedStudents,
  getSpecialRecordStudents,
  getOrganizationDetailById,
  getUnqualifiedStudentsHistory
};
