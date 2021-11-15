const { exec } = require("../db/mysql");
const xss = require("xss");
const strReplace = require("../middleware/strReplace");
const { pageSize } = require("../conf/page");
const getTeacher = async (teacherId,query,organizational_id,name,title,working_time,curPage=1) => {
  let sql = `select * from teacher where 1=1   and is_deleted=${0} `;
  if (query && typeof(query)!=='number') {
    sql += `and (name like  '%${query}%' or title like '%${query}%' or working_time like binary '%${query}%' or phone='${query}') `;
  }
  if(query && typeof(query)==='number'){
	  sql+=`and organizational_id=${query} `
  }
  if(organizational_id){
	  sql+= `and organizational_id=${organizational_id} `
  }
  if(name){
	  sql+= `and name=${name} `
  }
  if(title){
	  sql+= `and title=${title}% `
  }
  if(teacherId){
	  sql+= `and id=${teacherId} `
  }
  if(working_time){
	  sql+= `and working_time='%${working_time}%' `
  }
  let sql_count = sql.replace("*", "count(*)");
      sql += `limit ${(curPage - 1) * pageSize},${pageSize}`;
	  console.log(sql)
      const totalPageNum = await exec(sql_count);
      const res = await exec(sql);
      res.totalPageNum = Math.floor((totalPageNum[0]["count(*)"]+pageSize-1)/pageSize);
    
      return new Promise((resolve) => {
        resolve(res);
      });
};
async function createTeacher(data) {
  const {
    organizational_id,
    name,
    title,
    working_time,
    phone,
    birth,
    sex,
    address,
    admin_code,
    remark,
  } = data;
  if(typeof(organizational_id)==='undefined' || typeof(name)==='undefined' || typeof(title)==='undefined' || typeof(working_time)==='undefined' || typeof(phone)==='undefined' || typeof(birth)==='undefined' || typeof(address)==='undefined' || typeof(admin_code)==='undefined' || typeof(sex)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
  const sql = `insert into teacher(organizational_id,name,title,working_time,phone,birth,sex,address,admin_code,remark) values('${organizational_id}','${name}','${title}','${working_time}','${phone}','${birth}','${sex}','${address}',${admin_code},'${remark}')`;
  const sql_num = `select teacher_num from organizational where id =${organizational_id}`;
  let num = "";
  try {
    num = await exec(sql_num);
  } catch (error) {
    return {
      msg: "新建失败!请检查入参是否完整",
    };
  }

  num[0]["teacher_num"] += 1;
  let sql_in_num = `update organizational set teacher_num=${
    num[0]["teacher_num"]
  } where id =${organizational_id} and is_deleted=${0}`;
  const res = "";
  try {
    res = await exec(sql);
  } catch (error) {
    return {
      msg: err.sqlMessage,
    };
  }
  if (res.insertId) {
    await exec(sql_in_num);
  }
  return {
    id: res.insertId,
  };
}
const updateTeacher = (data) => {
  let {
    organizational_id,
    name,
    title,
    working_time,
    phone,
    birth,
    sex,
    address,
    admin_code,
    remark,
    id,
  } = data;
  if(typeof(id)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
  let sql = `update teacher set `;

  if (organizational_id) {
    sql += `organizational_id='${organizational_id}',`;
  }
  if (name) {
    sql += `name='${name}',`;
  }
  if (title) {
    sql += `title='${title}',`;
  }
  if (working_time) {
    sql += `working_time='${working_time}',`;
  }
  if (phone) {
    sql += `phone='${phone}',`;
  }
  if (birth) {
    sql += `birth='${birth}',`;
  }
  if(sex!==undefined){
    sql += `sex=${sex},`;
  }
  if (address) {
    sql += `address='${address}',`;
  }
  if (admin_code) {
    sql += `admin_code=${admin_code},`;
  }
  if (remark) {
    sql += `remark=${remark},`;
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
  });;
};
const delTeacher = (id) => {

  if(typeof(id)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
    let sql = `update teacher set is_deleted=${1} where id=${id}`;
  
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
const getTeachersCourse = async (data)=>{
  let {
      teacherId,
  } = data;
  if(typeof(teacherId)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
  let sql = `select * from (
    select distinct course.id as course_id ,relationship.id as relationship_id ,teacher.id as teacher_id,score_record.score_list from teacher 
    left join organizational on teacher.organizational_id = organizational.id 
    left join relationship on relationship.organizational_id = organizational.id 
    left join score_record on score_record.relation_id = relationship.id
    left join course on relationship.course_id = course.id where teacher.id=${teacherId} and course.is_deleted=${0} and organizational.is_deleted=${0} and teacher.is_deleted=${0} and relationship.is_deleted=${0}) as ur left join course on course.id = ur.course_id `;
            
			
			let res = await exec(sql);
			
			let newRes = arrDistinctByProp(res,'course_id')
			
			return new Promise(resolve=>{
				
				  resolve(newRes)
			})
  
}

const checkCourseIsLogScore = async (data)=>{
  let {
    teacherId,
    relationId,
    classId
  } = data;
  
  let sql =  `select count(*) from score_record
              left join student on student.id = score_record.studentId
              left join class on class.id = student.class_id
              left join teacher on teacher.id = class.headmaster_id           
              where teacher.id=${teacherId} and score_record.relation_id=${relationId} and class.id=${classId}`
  return exec(sql);
}
const getTeacherAllStudents = async (data)=>{
    let {
		query,
       teacherId,
       curPage=1,
       stuCode,
       stuName
    } = data;


  let sql = `select teacher.id as teacherId,student.* from teacher
             left join class on teacher.id=class.headmaster_id
             left join student on class.id = student.class_id`;
			  
			if(query){
				sql+=` and (student.stuCode like '%${query}%' or student.name like '%${query}%') `
			}
			 
			 
             if(stuCode){
               sql+=` and student.stuCode='${stuCode}'`
             }
             if(stuName){
              sql+=` and student.name like '%${stuName}%'`
             }
             const total = await exec(sql);
             
			 
			 
			 sql +=  `  where teacher.id=${teacherId} and teacher.is_deleted=${0}  and class.is_deleted=${0} and student.is_deleted=${0}`
			 
			 
             sql += ` limit ${(curPage - 1) * pageSize},${pageSize}`;
			
			
			 console.log(sql)
           
              const res = await exec(sql);
              res.totalPageNum = Math.floor((total.length+pageSize-1)/pageSize);
              
             return new Promise((resolve) => {
               resolve(res);
             });

  
}
function arrDistinctByProp(arr,prop){
            let obj = {};
            return arr.reduce(function(preValue,item){
                obj[item[prop]] ? '' : obj[item[prop]] = true && preValue.push(item);
                return preValue
            },[])
}
const getTeacherStudentsCourse = async (data)=>{
  let {
    teacherId,
    relationId,
    classId

  } = data

  if(typeof(classId)==='undefined' || typeof(teacherId)==='undefined' || typeof(relationId)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
 /* let sql =`select teacher.id as teacher_id,student.*,score_record.score_list as score_list from score_record 
  left join student on student.id = score_record.studentId
  left join class on class.id=student.class_id
  left join teacher on teacher.id = class.teacher_id
  where teacher.id=${teacherId}
  and class.id=${classId}
  and score_record.relation_id=${relationId} 
  and score_record.is_deleted=${0}
  and student.is_deleted=${0} 
  and class.is_deleted=${0} 
  and teacher.is_deleted=${0}
  `
  */
  
  let sql = `select distinct studentId from score_record where score_record.is_deleted=${0}`;
  
  let sql_duplicate = `select teacher.id as teacher_id,student.* from score_record 
  left join student on student.id = score_record.studentId
  left join class on class.id=student.class_id
  left join teacher on teacher.id = class.headmaster_id
  where teacher.id=${teacherId}
  and class.id=${classId}
  and score_record.relation_id=${relationId} 
  and score_record.is_deleted=${0}
  and student.is_deleted=${0} 
  and class.is_deleted=${0} 
  and teacher.is_deleted=${0}  order by student.stuCode`
  
  
  
  let ids = await exec(sql);
  
  let ids_get_score=[];
  
  let duplicateRes = await exec(sql_duplicate)
  
  let notDuplicateRes = arrDistinctByProp(duplicateRes,'id')
  

  
  ids.map(item=>{
	    
	    for(let item_du of notDuplicateRes){
			
			 if(item_du.id === item.studentId){
				  ids_get_score.push(item)
			 }
		}
  })
    console.log(ids_get_score)
  //console.log(ids_get_score)
  /*ids_get_score.map(async (item,index)=>{
	  let sql_get_score = `select score_list from score_record where studentId = ${item.studentId}`;
	  
	  let score_res = await exec(sql_get_score)
	  
	  notDuplicateRes[index].scores = score_res;
	  //console.log(notDuplicateRes[index])
	  
  })*/
  
  for(let index in ids_get_score){
	  let sql_get_score = `select score_list,id as score_id,special_record,rank from score_record where studentId = ${ids_get_score[index].studentId} and relation_id=${relationId}`;
	  
	  let score_res = await exec(sql_get_score)
	  
	  //查询这门课作业是否完成
	  notDuplicateRes[index].scores = score_res;
	  
	  let sql_get_work = `select * from student_work_record where student_id = ${ids_get_score[index].studentId} and relation_id=${relationId}`;
	  
	  let work_res = await exec(sql_get_work);
	  notDuplicateRes[index].works = work_res;
  }
  
  //console.log(notDuplicateRes)
  
  return new Promise(resolve=>{
	   resolve(notDuplicateRes)
  });
}
module.exports = {
  getTeacher,
  createTeacher,
  delTeacher,
  updateTeacher,
  getTeachersCourse,
  checkCourseIsLogScore,
  getTeacherAllStudents,
  getTeacherStudentsCourse
};
