const { exec } = require("../db/mysql");
const xss = require("xss");
const strReplace = require("../middleware/strReplace");
const { pageSize } = require("../conf/page");
function getCourseCode() {
    var orderCode = "";
    for (
      var i = 0;
      i < 8;
      i++ //6位随机数，用以加在时间戳后面。
    ) {
      orderCode += Math.floor(Math.random() * 10);
    }
    orderCode = new Date().getTime() + orderCode; //时间戳，用来生成订单号。
    
    return orderCode;
  }
const courseSeniorSearch = (types,classes)=>{
	let typeArr;
	let classArr;
	let sql;
	if(typeof(types) !== 'undefined'){
			typeArr = types.split(',');
			
	}
	if(typeof(classes) !== 'undefined'){
			classArr = classes.split(',');
	
	}
	 
	 
	
}
const getCourse = async (id,code,name,curPage=1,query)=>{
      let sql = `select * from course where is_deleted=${0} `;
    
     /* if (code) {
        sql += `or code like  '%${code}%' `;
      }*/
	  
	  
	  
	  
      if (query) {
        sql += `and name like '%${query}%' `;
      }
	  
	  
      let sql_count = sql.replace("*", "count(*)");
      sql += `limit ${(curPage - 1) * pageSize},${pageSize}`;
      const totalPageNum = await exec(sql_count);
      const res = await exec(sql);
      res.totalPageNum = Math.floor((totalPageNum[0]["count(*)"]+pageSize-1)/pageSize);

      return new Promise((resolve) => {
        resolve(res);
      });
}




const createCourse= (data)=>{
   
    
     for(let item of data){
      let {name,code,classLevel,types,course_no,index_list,is_red_list,remark} = item;

      if(!remark){
          remark = ''
      }
      if(!code){
         code = getCourseCode();
      }
      if(typeof(name)==='undefined' || typeof(classLevel)==='undefined' || typeof(types)==='undefined' || typeof(course_no)==='undefined' || typeof(index_list)==='undefined' || typeof(is_red_list)==='undefined'){
        return new Promise((resolve,reject)=>{
          reject({
            msg:'参数不全'
        })
      })
       
     
      }
        let sql =  `insert into course(name,code,class,types,course_no,index_list,is_red_list,remark) values('${name}','${code}','${classLevel}','${types}','${course_no}','${index_list}','${is_red_list}','${remark}')`;
        
         exec(sql)
     }
 
    return new Promise(resolve=>{
        resolve({
          msg:'插入成功'
      })
    })
}
const updateCourse=(data)=>{
    
    let {id,name,code,classLevel,types,course_no,index_list,is_red_list,remark} = data;
    if(typeof(id)==='undefined'){
      return new Promise(reject=>{
        reject({
           msg: '参数不全'
        })
     })
    }
    let sql = `update course set `;
    if (name) {
        sql += `name='${name}',`;
      }
      if (code) {
        sql += `code='${code}',`;
      }
      if (classLevel) {
        sql += `class='${classLevel}',`;
      }
      if (types) {
        sql += `types='${types}',`;
      }
      if (course_no) {
        sql += `course_no='${course_no}',`;
      }
      if (index_list) {
        sql += `index_list='${index_list}',`;
      }
      if (is_red_list!=='undefined') {
        sql += `is_red_list='${is_red_list}',`;
      }
      if (remark) {
        sql += `remark='${remark}',`;
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
}
const delCourse = (id)=>{
  if(typeof(id)==='undefined'){
    return new Promise(reject=>{
      reject({
        msg: '参数不全'
      })
    })
  }
    const sql = `update course set is_deleted=${1} where id=${id}`;
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


const getCourseDetail = async (data)=>{

  var res = [];

  let  sql = `select course.*,
  score_record.id as score_id,
  score_record.studentId as student_id,
  score_record.relation_id as relationId,
  score_record.score_list as score_list,
  score_record.gpa as gpa,
  score_record.is_up_to_standard as is_up_to_standard,
  score_record.is_advice as is_advice,
  score_record.analysis as analysis,
  score_record.special_record as special_record,
  score_record.rank as rank,
  score_record.insert_time as insert_time,
  score_record.is_parent_implement as is_parent_implement,
  score_record.is_teacher_implement as is_teacher_implement,
  measures.measures_for_details as measures_for_details,
  measures.role as measures_role     
  from course  
  left join relationship on course.id = relationship.course_id 
  left join score_record on relationship.id = score_record.relation_id
  left join measures on score_record.id = measures.score_id  
  where course.id=${data.course_id} and score_record.studentId=${data.studentId}
  and score_record.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0} order by score_record.insert_time
 `;
 
  
   if(data.role == undefined){
	   data.role = "家长";
   }
  
	
  //console.log(sql);
 
  //return exec(sql);
  
  
  const dataList = await exec(sql);
  for(var i =0;i < dataList.length;i++){
	  if(dataList[i].measures_role == data.role ||  dataList[i].measures_role == null){
		  
		 //填充特别记录的视频
		 let sqlspecialRecordFile = `SELECT * FROM file_storage WHERE module_name = "特别记录" and module_id = ${dataList[i].score_id} and is_deleted=0  order by create_time desc`;
		 
		 const dataList1 = await exec(sqlspecialRecordFile);
		 dataList[i].specialRecordFile = dataList1;
		 res.push(dataList[i]);
	  }
  }
  
  
  
 
  return res;
  
}








//查询相应的成绩
const getSoreDataOfStudent =   async (data)=>{
	let  sql = `SELECT DISTINCT relation_id FROM  score_record WHERE studentId = ${data.studentId} and is_deleted = 0 order by insert_time desc`;
	
	const dataList = await exec(sql);
	let resScore = [];
	
	for(var i =0;i < dataList.length;i++){
			//根据每一个关系ID查询是否存在相应的数据
			var param1 = {"studentId":data.studentId,"is_up_to_standard":data.is_up_to_standard,"relation_id":dataList[i].relation_id}
			//var courseList =  getSoreDataOfStudent(param1)
			
			
			let  sql1 = `SELECT * FROM score_record WHERE studentId = ${param1.studentId}  and is_deleted = 0 and relation_id = ${param1.relation_id} order by insert_time  DESC`;			
			//let  sql1 = `SELECT * FROM score_record WHERE studentId = ${param1.studentId} and is_up_to_standard = ${param1.is_up_to_standard} and is_deleted = 0 and relation_id = ${param1.relation_id} order by insert_time  DESC`;
			const res1 = await exec(sql1);
			
		
			if(res1.length > 0){
				
				
				//获取这门课的课程信息
				
				
				let  idTemp = res1[res1.length - 1];
				
				
				let  sql2 = `SELECT relationship.id as relationId,relationship.course_id as course_id,course.* FROM relationship left join course on course.id = relationship.course_id and course.is_deleted = 0 WHERE relationship.id = ${idTemp.relation_id} and relationship.is_deleted = 0`;
				

				console.log(sql2)
				
				const res2 = await exec(sql2);
				
				let courseId = 0;
				
				if(res2.length > 0){
					res1[res1.length - 1].course_detail = res2[0]
					courseId = res2[0].course_id;
					
				}
				
				
				//获取这门课成绩的作业详情
				let  sql3 = `SELECT student_work_record.id as homeworkid ,fs.* from student_work_record left join file_storage as fs on fs.module_name="homework" and student_work_record.id = fs.module_id and fs.is_deleted=0 where student_work_record.student_id = ${data.studentId} and student_work_record.relation_id = ${idTemp.relation_id} and student_work_record.is_deleted = 0 order by fs.create_time`
				console.log(sql3)
				const res3 = await exec(sql3);
				
				if(res3.length > 0){
					res1[res1.length - 1].homework_detail = res3[res3.length - 1]
					
				}
				
				//获取这门课的作业
				
				let  sql4 = `SELECT * FROM file_storage WHERE module_name = "课程" and module_id = ${courseId} and file_usage = "作业"`
				if(courseId != 0)
				{
					console.log(sql4)
					const res4 = await exec(sql4);
					if(res4.length > 0){
						
						res1[res1.length - 1].course_homework = res4[res4.length - 1]
					}
					
				}
				
				resScore.push(res1[res1.length - 1])  //只要最后一条
			}
			

		
	}
	
	console.log(resScore.length)
	
	//成绩列表
	//resScore = [];
	
	//let  sql1 = `SELECT * FROM score_record WHERE studentId = ${data.studentId} and is_up_to_standard = ${data.is_up_to_standard} and is_deleted = 0 and relation_id = ${data.relation_id} order by insert_time`;
	//获取成绩结果集
	//const res1 = await exec(sql1);
	
	

	
	
	
	//console.log(res.length)
	
    return   resScore; 
}


//通过作业ID作业详情
const getHomeWorkDetail =   async (data)=>{
	
	//查询这个作业的信息
	let  sql = `SELECT  *  FROM  student_work_record WHERE id = ${data.homeWorkId} and is_deleted = 0`;
	const dataList = await exec(sql);
	
	
	if(dataList.length > 0){
		var tempwork = dataList[0].relation_id;
		
		
		
		
		let  sql2 = `SELECT * FROM relationship WHERE id =  ${tempwork} and is_deleted = 0`;
		const dataList1 = await exec(sql2);
		
		
		console.log(dataList1);
		
		
		
		if(dataList1.length > 0){
			courseId = dataList1[0].course_id;	
			let  sql4 = `SELECT * FROM file_storage WHERE module_name = "课程" and module_id = ${courseId} and file_usage = "作业" order by create_time`
			const res4 = await exec(sql4);
			
			dataList[0].CourseHomeWorkInfo = res4;
			
			
			//获取这门课的作业
			let  sql3 = `SELECT * FROM file_storage WHERE module_name = "homework" and module_id = ${data.homeWorkId} and file_usage = "作业情况"   order by create_time`
			console.log(sql3)
			const res3 = await exec(sql3);
				
			if(res3.length > 0){
				
				dataList[0].HomeWorkInfoFileDetail = res3;
			}
			
		}
		
	}
	
	return   dataList; 
}






//通过机构ID查询机构详情
const getCourseWorkDetailInnfo =  async (data)=>{
	
	
	/*let res = {};
	
	
	//查询作业 
	let  sql2 = `SELECT * FROM relationship WHERE id =  ${data.module_id} and is_deleted = 0`;
	const dataList = await exec(sql2);
	
	
	
	
	if(dataList.length > 0){
		let homeWorkId = dataList[0].course_id;
		
		
		//通过课程ID 查询课程详情
		let sql1 = `SELECT * FROM `course` WHERE `id` = ${homeWorkId}`;
		const dataList1 = await exec(sql1);
		res.courseInfo = dataList1;
		
		

		let  sql3 = `SELECT * FROM file_storage WHERE module_name = "homework" and module_id = ${homeWorkId} and file_usage = "作业情况"   order by create_time`
		//console.log(sql3)
		const res3 = await exec(sql3); 
		res.courseWorkInfo = dataList1;
		
		
		
		
	}
	
	
	

	
	return   dataList; */
}



module.exports = {
    getCourse,
    createCourse,
    updateCourse,
    delCourse,
    getCourseDetail,
	getSoreDataOfStudent,
	getHomeWorkDetail,
	getCourseWorkDetailInnfo,
	courseSeniorSearch
}