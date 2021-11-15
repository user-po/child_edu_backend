
const { exec } = require("../db/mysql");


const login = (data)=>{
     const {
        userName,
        userType='student',
        password

     }=data;

     const sql = `select user.company_id as studentId,user.user_name as userName,user.admin_code as adminCode,user.phone as phone,user.sex as sex,user.user_type as userType,user.head_logo as headLogo from user where user_name='${userName}' and password='${password}' and user_type='${userType}'`;

     return exec(sql)
}


//修改密码
const updateUser=(data)=>{
    let {passWord,username} = data;
	console.log(data)
    if(typeof(username)==='undefined' ||  typeof(passWord)==='undefined'){
      return new Promise(reject=>{
        reject({
           msg: '参数不全'
        })
     })
    }
    let sql = `UPDATE user SET password = "${passWord}" WHERE user_name = "${username}"`;
     
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
    login,
	updateUser
}