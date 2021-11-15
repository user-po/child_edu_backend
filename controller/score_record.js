const { exec } = require("../db/mysql");
const xss = require("xss");
const strReplace = require("../middleware/strReplace");
const { pageSize } = require("../conf/page");
const FULL_SCORE = 10;
const getScore= async (studentId,relation_id,id,curPage=1)=>{
    let sql = `select score_record.*,course.name as course_name from score_record 
               left join relationship on relationship.id = score_record.relation_id
               left join course on  course.id = relationship.course_id  
    where 1=1 and score_record.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
    `;
    if (id) {
        sql += `and id=${id} `;
      }
      if (relation_id) {
        sql += `and relation_id=${relation_id} `;
      }
      if (studentId) {
        sql += `and studentId=${studentId} `;
      }
     // let sql_count = sql.replace("*", "count(*)");
      sql += `limit ${(curPage - 1) * pageSize},${pageSize}`;
      //console.log(sql)
      //const totalPageNum = await exec(sql_count);
	  console.log(sql)
      const res = await exec(sql);
      res.totalPageNum = Math.floor((res.length+pageSize -1)/pageSize);
    
      return new Promise((resolve) => {
        resolve(res);
      });
}




//根据学生ID获取成绩数据
const getScoreListByStudent = async (data)=>{
	
	let studentId = data.studentId;
	
	//获取这个学生有哪些课程
	var res_res = [];
	let sql = `SELECT distinct relation_id FROM score_record WHERE studentId = ${studentId} and is_deleted=${0}`
	const res = await exec(sql);
	
	//遍历课程，查询最新成绩
	
	for(var i =0;i < res.length;i++){
		
		let relation_id_temp =  res[i].relation_id;
		let sql2 = `SELECT * FROM score_record WHERE studentId = ${studentId} and relation_id = ${relation_id_temp} and is_deleted=${0} order by insert_time`
		const res1 = await exec(sql2);
		//通过关系ID查询课程名称
		let sql3 = `SELECT * FROM relationship left join course on course.id = relationship.course_id where relationship.id = ${relation_id_temp}`
		
		const res2 = await exec(sql3);
		
		if(res2.length > 0){
			
			res1[res1.length - 1].course_name = res2[0].name;
		}
		
		
		
		
		res_res.push(res1[res1.length - 1])
		
	}
	
	return res_res;
}





const createScore = async (data)=>{
  let reqArr = [];
   for(let item of data){
     
    let {studentId,relation_id,score_list,is_up_to_standard,is_advice,analysis='',special_record,is_parent_implement,is_teacher_implement,gpa=0.0,rank} =item;
    if(typeof(studentId)==='undefined' || typeof(relation_id)==='undefined' || typeof(score_list)==='undefined' || typeof(is_up_to_standard)==='undefined' || typeof(rank)==='undefined'){
      return new Promise(reject=>{
        reject({
          msg: '参数不全'
        })
      })
    }
    if(typeof(analysis)==='undefined'){
      analysis=null
    }
    if(typeof(special_record)==='undefined'){
      special_record=null
    }
    let sql = `insert into score_record(studentId,relation_id,score_list,gpa,is_up_to_standard,is_advice,analysis,special_record,rank,is_parent_implement,is_teacher_implement) values(${studentId},${relation_id},'${score_list}',${gpa},${is_up_to_standard},'${is_advice}','${analysis}','${special_record}',${rank},'${is_parent_implement}','${is_teacher_implement}')`
    
	console.log(sql)
	reqArr.push(exec(sql))
     
   }
   const res = await Promise.all(reqArr)
   return res
}
const updateScore= (data)=>{
    let {id,studentId,relation_id,score_list,is_up_to_standard,is_advice,analysis,special_record,is_parent_implement,is_teacher_implement} =data;
    if(typeof(id)==='undefined'){
      return new Promise(reject=>{
        reject({
          msg: '参数不全'
        })
      })
    }
    let gpa= 0.0;
    let sql = `update score_record set `;

    if (studentId) {
        sql += `studentId='${studentId}',`;
      }
      if (relation_id) {
        sql += `relation_id='${relation_id}',`;
      }
      if (score_list) {
        // let total = score_list.split(',').reduce((x,y)=>{
    
        //     return parseInt(x)+parseInt(y);
        //    })
        //    let length = score_list.split(',').length;
       
        //     gpa = total / (FULL_SCORE*length) * 100
           
        sql += `score_list='${score_list}'`;
        
      }
      if (gpa) { 
        // let total = score_list.split(',').reduce((x,y)=>{
    
        //     return parseInt(x)+parseInt(y);
        //    })
        //    let length = score_list.split(',').length;
       
        //     gpa = total / (FULL_SCORE*length) * 100
           
        sql += `gpa=${gpa}`;
        
      }
      if (typeof(is_up_to_standard)!=='undefined') {
        sql += `is_up_to_standard='${is_up_to_standard}',`;
      }
      if (typeof(is_advice)!=='undefined') {
        sql += `is_advice=${is_advice},`;
      }
      if (analysis) {
        sql += `analysis='${analysis}',is_advice=1,`;
      }
      if (special_record) {
        sql += `special_record='${special_record}',`;
      }
      if (typeof(is_parent_implement)!=='undefined') {
        sql += `is_parent_implement=${is_parent_implement},`;
      }
      if (typeof(is_teacher_implement)!=='undefined') {
        sql += `is_teacher_implement=${is_teacher_implement},`;
      }
      if(id){
        sql += `where id=${id} and is_deleted=${0}`;
      }
      sql = strReplace(sql, sql.indexOf("where") - 1, " ");
      console.log(sql)
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
}
const delScore = (id)=>{
  if(typeof(id)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
    const sql = `update score_record set is_deleted=${1} where id=${id}`;
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
}




//删除常用文本
const delCommonText = async (data)=>{
	
	
	for(let item of data){
		let {id} = item;
		if(typeof(id)==='undefined'){
			return new Promise(reject=>{
			  reject({
				msg: '参数不全'
			  })
			})
		}
		
		const sql = `update constant_advice set is_deleted=${1} where id=${id}`;
		
		const res = await exec(sql);
		
	}
    return true;
}


//查询常用文本
const getCommonText = async (username,type)=>{
      let sql = `select * from constant_advice where is_deleted=${0} `;
      
      if (username) {
        sql += `and user_name = '${username}' `;
      }
	  
	  
	  if (type) {
        sql += `  and type = ${type} `;
      }
	  
	 // console.log(sql)
      const res = await exec(sql);
	  
      return new Promise((resolve) => {
        resolve(res);
      });
}

//创建常用文本
const createCommonText= (data)=>{
    for(let item of data){
      let {user_name,type,content} = item;
	  

      if(typeof(user_name)==='undefined' || typeof(type)==='undefined' || typeof(content)==='undefined'){
        return new Promise((resolve,reject)=>{
          reject({
            msg:'参数不全'
        })
       })
      
      }
        let sql =  `insert into constant_advice(user_name,type,content) values('${user_name}',${type},'${content}')`;
		
		console.log(sql);
        exec(sql)
     }
 
    return new Promise(resolve=>{
        resolve({
          msg:'插入成功'
      })
    })
}





//插入专家意见
const createExpertAdviseRecord= (data)=>{
    for(let item of data){
      let {student_id,score_id,teacher_measure,parent_measure} = item;
	  

      if(typeof(student_id)==='undefined' || typeof(score_id)==='undefined' || typeof(teacher_measure)==='undefined' || typeof(parent_measure)==='undefined'){
        return new Promise((resolve,reject)=>{
          reject({
            msg:'参数不全'
        })
       })
      
      }
        let sql =  `insert into expert_advise_record(student_id,score_id,teacher_measure,parent_measure) values(${student_id},${score_id},'${teacher_measure}','${parent_measure}')`;
		
		console.log(sql);
        exec(sql)
     }
 
    return new Promise(resolve=>{
        resolve({
          msg:'插入成功'
      })
    })
}





//利用成绩ID查询学生作业ID
const queryWorkinfoByScored  = async (scoreId)=>{
	console.log("1111111111111111")
	let sql = `SELECT * FROM score_record left join student_work_record on score_record.studentId = student_work_record.student_id and score_record.relation_id = student_work_record.relation_id where score_record.id = ${scoreId}`
	
	const res = await exec(sql);
	return new Promise((resolve) => {
		resolve(res);
	});
}



const readOk = (id)=>{
  if(typeof(id)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
  
  
    const sql = `update score_record set is_read=${1} where id=${id}`;
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
}



module.exports = {
    getScore,
    createScore,
    updateScore,
    delScore,
	getScoreListByStudent,
	createCommonText,
	getCommonText,
	delCommonText,
	queryWorkinfoByScored,
	createExpertAdviseRecord,
	readOk
}