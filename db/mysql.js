const mysql = require("mysql");
const { MYSQL_CONF } = require("../conf/db");

// 创建连接对象

var pingInterval = null;

const con = mysql.createConnection(MYSQL_CONF);

// 开始连接
con.connect();


clearInterval(pingInterval);
pingInterval = setInterval(() => {
	con.ping((err) => {
		
		if (err) {
			console.log('ping error: ' + JSON.stringify(err));
		}
	});
}, 10000);
//3600000*3

// 统一执行sql的函数
function exec(sql) {
  const promise = new Promise((resolve, reject) => {
    con.query(sql, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });

  return promise;
}



function exec1(sql) {
  const promise = new Promise((resolve, reject) => {
    con.query(sql, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });

  return promise;
}

module.exports = {
  exec,
  exec1,
  escape: mysql.escape,
};
