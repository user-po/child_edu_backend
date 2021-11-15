const { exec } = require("../db/mysql");
const xss = require("xss");
const strReplace = require("../middleware/strReplace");
const { pageSize } = require("../conf/page");
const { getCount, getBirthDay, compareTime, getAge } = require("../utils/util");
function unique(arr) {
  const res = new Map();
  return arr.filter((arr) => !res.has(arr.id) && res.set(arr.id, 1));
}
const groupUnqualifiedStudentsBySex = async (query) => {
  const { teacherId, realtionId } = query;
  let new_sql_class_students_res = [];
  const BOY_UNQ = [];
  const BOY_Q = [];
  const GIRL_UNQ = [];
  const GIRL_Q = [];
  //1. 获取某个老师名下选了某门课的所有学生的成绩
  const sql_class_students = `select student.id as studentId,student.name as studentName,student.sex as studentSex,course.*,class.id as classId,score_record.is_up_to_standard from student 
                                left join score_record on score_record.studentId = student.id
                                left join class on class.id = student.class_id
                                left join teacher on teacher.id = class.teacher_id
                                left join organizational on organizational.id = teacher.organizational_id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on course.id = relationship.course_id
                                where relationship.id=${realtionId} and teacher.id=${teacherId} and course.is_deleted=${0} and teacher.is_deleted=${0} and relationship.is_deleted=${0}
                                `;

  const sql_class_students_res = await exec(sql_class_students);

  new_sql_class_students_res = sql_class_students_res.reduce((pre, cur) => {
    new_sql_class_students_res[cur.studentId]
      ? ""
      : (new_sql_class_students_res[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);

  //2. 获取这个班级这门课的男生的达标和不达标成绩

  //3. 获取这个班级这门课的女生的达标和不达标成绩
  new_sql_class_students_res.map((item, index) => {
    if (item.studentSex === 1 && item.is_up_to_standard === 0) {
      BOY_UNQ.push(item);
    }
    if (item.studentSex === 1 && item.is_up_to_standard === 1) {
      BOY_Q.push(item);
    }
    if (item.studentSex === 0 && item.is_up_to_standard === 0) {
      GIRL_UNQ.push(item);
    }
    if (item.studentSex === 0 && item.is_up_to_standard === 1) {
      GIRL_Q.push(item);
    }
  });
  return {
    UNQ: [BOY_UNQ.length, GIRL_UNQ.length],
    Q: [BOY_Q.length, GIRL_Q.length],
  };

  //4. 将获取的数据融合到一个对象中返回
};
const groupGradeStudentsBySex = async (query) => {
  const { level,startTime,endTime } = query;
  let BOY_UNQ = [];
  let BOY_Q = [];
  let GIRL_UNQ = [];
  let GIRL_Q = [];
  let sql = `select student.id,student.name,student.sex,score_record.is_up_to_standard from class
   left join student on student.class_id = class.id
   right join score_record on score_record.studentId=student.id
   where class.class='${level}' and student.is_deleted=${0} and class.is_deleted=${0} and score_record.is_deleted=${0}`;
  
   if(typeof startTime!=='undefined' && typeof endTime!=='undefined'){
    sql = `select student.id,student.name,student.sex,score_record.is_up_to_standard from class
    left join student on student.class_id = class.id
    right join score_record on score_record.studentId=student.id
    where class.class='${level}' and student.is_deleted=${0} and class.is_deleted=${0} and score_record.is_deleted=${0} 
    and score_record.insert_time>='${startTime}' and score_record.insert_time<='${endTime}'`

   }
   
  let res = unique(await exec(sql));

  res.map((item) => {
    if (item.sex == 1 && item.is_up_to_standard == 1) {
      BOY_Q.push(item);
    }
    if (item.sex == 1 && item.is_up_to_standard == 0) {
      BOY_UNQ.push(item);
    }
    if (item.sex == 0 && item.is_up_to_standard == 1) {
      GIRL_Q.push(item);
    }
    if (item.sex == 0 && item.is_up_to_standard == 0) {
      GIRL_UNQ.push(item);
    }
  });

  return {
    UNQ: [BOY_UNQ.length, GIRL_UNQ.length],
    Q: [BOY_Q.length, GIRL_Q.length],
  };
};
const groupGradeStudentsByAge = async (query) => {
  const { level,startTime,endTime } = query;
  let ages = [];
  let ages_name = [];
  let ages_scale = 7;
  let sql = `select student.id,student.name,student.age,score_record.is_up_to_standard from class
  left join student on student.class_id = class.id
  right join score_record on score_record.studentId=student.id
  where class.class='${level}' and student.is_deleted=${0} and class.is_deleted=${0} and score_record.is_deleted=${0}`;
 
  if(typeof startTime!=='undefined' && typeof endTime!=='undefined'){
    sql = `select student.id,student.name,student.age,score_record.is_up_to_standard from class
    left join student on student.class_id = class.id
    right join score_record on score_record.studentId=student.id
    where class.class='${level}' and student.is_deleted=${0} and class.is_deleted=${0} and score_record.is_deleted=${0}
    and score_record.insert_time>='${startTime}' and score_record.insert_time<='${endTime}'
  `
  }
  let res = unique(await exec(sql));

  for (let i = 0; i < ages_scale; ++i) {
    ages[i] = 0;
    ages_name[i] = i + 1 + "岁";
  }

  res.map((item) => {
    ages[item.age]++;
  });

  return {
    ages: ages.slice(1, ages.length),
    ages_name: ages_name.slice(0, ages.length - 1),
  };
};
const groupGradeStudentsByScore = async (query) => {
  const { level,startTime,endTime } = query;
  let sql = `select student.id,class.class_no,student.name,score_record.gpa from class
  left join student on student.class_id = class.id
  right join score_record on score_record.studentId=student.id
  where class.class='${level}' and student.is_deleted=${0} and class.is_deleted=${0} and score_record.is_deleted=${0} and score_record.is_up_to_standard=${1}`;
  let sql_class_name = `select class.class_no from class where class.class='${level}' and class.is_deleted=${0}`;
  if(typeof startTime!=='undefined' && typeof endTime!=='undefined'){
    sql = `select student.id,class.class_no,student.name,score_record.gpa from class
  left join student on student.class_id = class.id
  right join score_record on score_record.studentId=student.id
  where class.class='${level}' and student.is_deleted=${0} and class.is_deleted=${0} and score_record.is_deleted=${0} and score_record.is_up_to_standard=${1}
  and score_record.insert_time>='${startTime}' and score_record.insert_time<='${endTime}'
  `
  }
  let res_name = await exec(sql_class_name);
  let res = await exec(sql);
  let total;
  let scores = [];
  let names = [];
  let totals = [];
  res_name.map((name) => {
    total = 0;
    res.map((item) => {
      if (item.class_no == name.class_no) {
        total += item.gpa;
      }
    });

    scores.push({ name: name.class_no, total });
  });
  scores.sort((a, b) => {
    return b.total - a.total;
  });

  scores.map((item) => {
    names.push(item.name);
    totals.push(item.total);
  });

  return {
    names,
    totals,
  };
};
const getClassInfo = async (query) => {
  let { level } = query;

  let sql = `select class_no,teacher_id from class where class.class='${level}' and class.is_deleted=${0}`;

  const res = await exec(sql);

  return res;
};
const groupStudentsByAge = async (query) => {
  const { teacherId, realtionId, classId } = query;
  let sql = `select * from class  where id=${classId} and is_deleted=${0}`;
  const classInfo = await exec(sql);
  let el = [];
  let age = [];
  let res = [];
  let new_sql_class_students_res = [];
  const bigClassAgeSeg = [
    "5岁1月0天-5岁3月0天",
    "5岁3月0天-5岁6月0天",
    "5岁6月0天-6岁0月0天",
  ];
  const middleClassAgeSeg = [
    "4岁1月0天-4岁3月0天",
    "4岁3月0天-4岁6月0天",
    "4岁6月0天-5岁0月0天",
  ];
  const smallClassAgeSeg = [
    "3岁1月0天-3岁3月0天",
    "3岁3月0天-3岁6月0天",
    "3岁6月0天-4岁0月0天",
  ];

  const birtyhdayBigClassAgeSeg = [];
  const birtyhdayMiddleClassAgeSeg = [];
  const birtyhdaySmallClassAgeSeg = [];
  //1. 获取某个老师名下选了某门课的所有学生的成绩
  const sql_class_students = `select student.id as studentId,student.name as studentName,student.birth as studentBirth from student 
                                left join score_record on score_record.studentId = student.id
                                left join class on class.id = student.class_id
                                left join teacher on teacher.id = class.teacher_id
                                left join organizational on organizational.id = teacher.organizational_id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on course.id = relationship.course_id
                                where relationship.id=${realtionId} and teacher.id=${teacherId} and course.is_deleted=${0} and teacher.is_deleted=${0} and relationship.is_deleted=${0} and student.is_deleted=${0}
                                `;

  const sql_class_students_res = await exec(sql_class_students);

  // 去重
  new_sql_class_students_res = sql_class_students_res.reduce((pre, cur) => {
    new_sql_class_students_res[cur.studentId]
      ? ""
      : (new_sql_class_students_res[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);

  //分割并映射年龄
  new_sql_class_students_res.map((item) => {
    // const stuAge  = getAge(item.studentBirth.split(" ")[0].split("-"))
    //let stuStr = stuAge[0]+'岁'+stuAge[1]+'月'+stuAge[2]+'日'

    age.push(item.studentBirth.split(" ")[0]);
  });
  console.log(new_sql_class_students_res);
  if (classInfo[0].class === "大班") {
    el = [];

    bigClassAgeSeg.map((item) => {
      const birthdayStrBegin = getBirthDay(item.split("-")[1]);
      const birthdayStrEnd = getBirthDay(item.split("-")[0]);
      birtyhdayBigClassAgeSeg.push(birthdayStrBegin + "," + birthdayStrEnd);
    });
    for (let i = 0; i < birtyhdayBigClassAgeSeg.length; ++i) {
      el.push({ name: bigClassAgeSeg[i], value: 0 });
    }

    birtyhdayBigClassAgeSeg.map((item, index) => {
      for (let i = 0; i < age.length; ++i) {
        let isIn = compareTime(item.split(",")[0], item.split(",")[1], age[i]);

        if (isIn) {
          el[index].name = bigClassAgeSeg[index];
          el[index].value++;
        }
      }
    });
  }
  if (classInfo[0].class === "中班") {
    el = [];

    middleClassAgeSeg.map((item) => {
      const birthdayStrBegin = getBirthDay(item.split("-")[1]);
      const birthdayStrEnd = getBirthDay(item.split("-")[0]);
      birtyhdayMiddleClassAgeSeg.push(birthdayStrBegin + "," + birthdayStrEnd);
    });
    for (let i = 0; i < birtyhdayMiddleClassAgeSeg.length; ++i) {
      el.push({ name: middleClassAgeSeg[i], value: 0 });
    }

    birtyhdayMiddleClassAgeSeg.map((item, index) => {
      for (let i = 0; i < age.length; ++i) {
        let isIn = compareTime(item.split(",")[0], item.split(",")[1], age[i]);

        if (isIn) {
          el[index].name = middleClassAgeSeg[index];
          el[index].value++;
        }
      }
    });
  }
  if (classInfo[0].class === "小班") {
    el = [];

    smallClassAgeSeg.map((item) => {
      const birthdayStrBegin = getBirthDay(item.split("-")[1]);
      const birthdayStrEnd = getBirthDay(item.split("-")[0]);
      birtyhdaySmallClassAgeSeg.push(birthdayStrBegin + "," + birthdayStrEnd);
    });
    for (let i = 0; i < birtyhdaySmallClassAgeSeg.length; ++i) {
      el.push({ name: smallClassAgeSeg[i], value: 0 });
    }

    birtyhdaySmallClassAgeSeg.map((item, index) => {
      for (let i = 0; i < age.length; ++i) {
        let isIn = compareTime(item.split(",")[0], item.split(",")[1], age[i]);

        if (isIn) {
          el[index].name = smallClassAgeSeg[index];
          el[index].value++;
        }
      }
    });
  }

  el.map((item) => {
    if (item.name !== "") {
      res.push(item);
    }
  });
  return res;
};
const groupStudentsQuSituationByScore = async (query) => {
  const { teacherId, realtionId } = query;
  const name = [];
  const gpa = [];
  let new_sql_class_students_res = [];
  //1. 获取某个老师名下选了某门课的所有学生的成绩
  const sql_class_students = `select student.id as studentId,student.name as studentName,course.*,class.id as classId,score_record.gpa from student 
                                left join score_record on score_record.studentId = student.id
                                left join class on class.id = student.class_id
                                left join teacher on teacher.id = class.teacher_id
                                left join organizational on organizational.id = teacher.organizational_id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on course.id = relationship.course_id
                                where relationship.id=${realtionId} and teacher.id=${teacherId} and course.is_deleted=${0} and teacher.is_deleted=${0} and relationship.is_deleted=${0} and student.is_deleted=${0}
                                `;
  const sql_class_students_res = await exec(sql_class_students);
  // 去重
  new_sql_class_students_res = sql_class_students_res.reduce((pre, cur) => {
    new_sql_class_students_res[cur.studentId]
      ? ""
      : (new_sql_class_students_res[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);

  new_sql_class_students_res.map((item) => {
    name.push(item.studentName);
    gpa.push(item.gpa);
  });

  return {
    name,
    gpa,
  };
};
const groupStudentsQuSituationByList = async (query) => {
  const { teacherId, realtionId } = query;
  const red_list_name = [];
  const red_list_up_count = [];
  const red_list_not_up_count = [];
  const up_score = 4;
  let new_sql_class_students_res = [];
  //1. 获取某个老师名下选了某门课的所有学生的成绩
  const sql_class_students = `select student.id as studentId,student.name as studentName,course.*,class.id as classId,score_record.score_list from student 
                                left join score_record on score_record.studentId = student.id
                                left join class on class.id = student.class_id
                                left join teacher on teacher.id = class.teacher_id
                                left join organizational on organizational.id = teacher.organizational_id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on course.id = relationship.course_id
                                where relationship.id=${realtionId} and teacher.id=${teacherId} and course.is_deleted=${0} and teacher.is_deleted=${0} and relationship.is_deleted=${0} and student.is_deleted=${0}
                                `;
  const sql_class_students_res = await exec(sql_class_students);

  // 去重
  new_sql_class_students_res = sql_class_students_res.reduce((pre, cur) => {
    new_sql_class_students_res[cur.studentId]
      ? ""
      : (new_sql_class_students_res[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);

  new_sql_class_students_res.map((item) => {
    if (item.is_red_list !== null) {
      item.is_red_list.split(",").map((itemR, index) => {
        if (itemR == 1) {
          if (item.index_list !== null && item.score_list !== null) {
            if (
              red_list_name.indexOf(item.index_list.split(",")[index]) == -1
            ) {
              red_list_name.push(item.index_list.split(",")[index]);
              red_list_up_count[index] = 0;
              red_list_not_up_count[index] = 0;
            }

            if (item.score_list.split(",")[index] >= up_score) {
              red_list_up_count[index]++;
            }

            if (item.score_list.split(",")[index] < up_score) {
              red_list_not_up_count[index]++;
            }
          }
        }
      });
    }
  });

  return {
    red_list_name,
    red_list_up_count,
    red_list_not_up_count,
  };
};
const groupAllStudentsQuSituationBySex = async (data) => {
  let { classId } = data;
  let allStuScore = [];
  let BOY_UNQ = [];
  let BOY_Q = [];
  let GIRL_UNQ = [];
  let GIRL_Q = [];
  let has_id = {};
  let new_sql_score_students_res = [];
  if (typeof classId === "undefined") {
    return new Promise((reject) => {
      reject({
        msg: "参数不全",
      });
    });
  }

  let sql_stu = `
           select class.id,student.* from class left join
           student on class.id = student.class_id where class.id = ${classId} and student.is_deleted=${0}`;

  const allStu = await exec(sql_stu);

  for (let item of allStu) {
    let sql_score = `select  score_record.*,student.sex as studentSex from score_record left join student on student.id = score_record.studentId where score_record.studentId=${item.id}`;

    const res = await exec(sql_score);

    allStuScore.push(res);
  }

  allStuScore = allStuScore.flat(Infinity);
  // 去重
  new_sql_score_students_res = allStuScore.reduce((pre, cur) => {
    new_sql_score_students_res[cur.studentId]
      ? ""
      : (new_sql_score_students_res[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);

  new_sql_score_students_res.map((item, index) => {
    allStuScore.map((iSocre) => {
      if (item.studentId == iSocre.studentId && iSocre.studentSex == 1) {
        if (iSocre.is_up_to_standard == 0) {
          BOY_UNQ.push(iSocre);
          has_id[iSocre.studentId] = true;
        }
      }
      if (item.studentId == iSocre.studentId && iSocre.studentSex == 0) {
        if (iSocre.is_up_to_standard == 0) {
          GIRL_UNQ.push(iSocre);
          has_id[iSocre.studentId] = true;
        }
      }
      if (
        iSocre.studentSex == 1 &&
        typeof has_id[iSocre.studentId] === "undefined"
      ) {
        BOY_Q.push(iSocre);
      }
      if (
        iSocre.studentSex == 0 &&
        typeof has_id[iSocre.studentId] === "undefined"
      ) {
        GIRL_Q.push(iSocre);
      }
    });
  });

  BOY_UNQ = BOY_UNQ.reduce((pre, cur) => {
    BOY_UNQ[cur.studentId]
      ? ""
      : (BOY_UNQ[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);
  BOY_Q = BOY_Q.reduce((pre, cur) => {
    BOY_Q[cur.studentId] ? "" : (BOY_Q[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);
  GIRL_UNQ = GIRL_UNQ.reduce((pre, cur) => {
    GIRL_UNQ[cur.studentId]
      ? ""
      : (GIRL_UNQ[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);
  GIRL_Q = GIRL_Q.reduce((pre, cur) => {
    GIRL_Q[cur.studentId]
      ? ""
      : (GIRL_Q[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);
  return {
    UNQ: [BOY_UNQ.length, GIRL_UNQ.length],
    Q: [BOY_Q.length, GIRL_Q.length],
  };
};
const groupAllStudentsQuSituationByAge = async (data) => {
  let { classId } = data;
  let sql = `select * from class  where id=${classId} and is_deleted=${0}`;
  const classInfo = await exec(sql);
  let el = [];
  let age = [];
  let res = [];
  let new_sql_class_students_res = [];
  const bigClassAgeSeg = [
    "5岁1月0天-5岁3月0天",
    "5岁3月0天-5岁6月0天",
    "5岁6月0天-6岁0月0天",
  ];
  const middleClassAgeSeg = [
    "4岁1月0天-4岁3月0天",
    "4岁3月0天-4岁6月0天",
    "4岁6月0天-5岁0月0天",
  ];
  const smallClassAgeSeg = [
    "3岁1月0天-3岁3月0天",
    "3岁3月0天-3岁6月0天",
    "3岁6月0天-4岁0月0天",
  ];

  const birtyhdayBigClassAgeSeg = [];
  const birtyhdayMiddleClassAgeSeg = [];
  const birtyhdaySmallClassAgeSeg = [];
  const sql_class_students = `select student.id as studentId,student.name as studentName,student.birth as studentBirth from student 
                                left join score_record on score_record.studentId = student.id
                                left join class on class.id = student.class_id
                                left join teacher on teacher.id = class.teacher_id
                                left join organizational on organizational.id = teacher.organizational_id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on course.id = relationship.course_id
                                where class.id=${classId} and course.is_deleted=${0} and teacher.is_deleted=${0} and relationship.is_deleted=${0} and student.is_deleted=${0}
                                `;

  const sql_class_students_res = await exec(sql_class_students);
  // 去重
  new_sql_class_students_res = sql_class_students_res.reduce((pre, cur) => {
    new_sql_class_students_res[cur.studentId]
      ? ""
      : (new_sql_class_students_res[cur.studentId] = true && pre.push(cur));
    return pre;
  }, []);
  //分割并映射年龄
  new_sql_class_students_res.map((item) => {
    age.push(item.studentBirth.split(" ")[0]);
  });

  if (classInfo[0].class === "大班") {
    el = [];

    bigClassAgeSeg.map((item) => {
      const birthdayStrBegin = getBirthDay(item.split("-")[1]);
      const birthdayStrEnd = getBirthDay(item.split("-")[0]);
      birtyhdayBigClassAgeSeg.push(birthdayStrBegin + "," + birthdayStrEnd);
    });
    for (let i = 0; i < birtyhdayBigClassAgeSeg.length; ++i) {
      el.push({ name: bigClassAgeSeg[i], value: 0 });
    }

    birtyhdayBigClassAgeSeg.map((item, index) => {
      for (let i = 0; i < age.length; ++i) {
        let isIn = compareTime(item.split(",")[0], item.split(",")[1], age[i]);

        if (isIn) {
          el[index].name = bigClassAgeSeg[index];
          el[index].value++;
        }
      }
    });
  }
  if (classInfo[0].class === "中班") {
    el = [];

    middleClassAgeSeg.map((item) => {
      const birthdayStrBegin = getBirthDay(item.split("-")[1]);
      const birthdayStrEnd = getBirthDay(item.split("-")[0]);
      birtyhdayMiddleClassAgeSeg.push(birthdayStrBegin + "," + birthdayStrEnd);
    });
    for (let i = 0; i < birtyhdayMiddleClassAgeSeg.length; ++i) {
      el.push({ name: middleClassAgeSeg[i], value: 0 });
    }

    birtyhdayMiddleClassAgeSeg.map((item, index) => {
      for (let i = 0; i < age.length; ++i) {
        let isIn = compareTime(item.split(",")[0], item.split(",")[1], age[i]);

        if (isIn) {
          el[index].name = middleClassAgeSeg[index];
          el[index].value++;
        }
      }
    });
  }
  if (classInfo[0].class === "小班") {
    el = [];

    smallClassAgeSeg.map((item) => {
      const birthdayStrBegin = getBirthDay(item.split("-")[1]);
      const birthdayStrEnd = getBirthDay(item.split("-")[0]);
      birtyhdaySmallClassAgeSeg.push(birthdayStrBegin + "," + birthdayStrEnd);
    });
    for (let i = 0; i < birtyhdaySmallClassAgeSeg.length; ++i) {
      el.push({ name: smallClassAgeSeg[i], value: 0 });
    }

    birtyhdaySmallClassAgeSeg.map((item, index) => {
      for (let i = 0; i < age.length; ++i) {
        let isIn = compareTime(item.split(",")[0], item.split(",")[1], age[i]);

        if (isIn) {
          el[index].name = smallClassAgeSeg[index];
          el[index].value++;
        }
      }
    });
  }
  el.map((item) => {
    if (item.name !== "") {
      res.push(item);
    }
  });

  return res;
};
const groupStudentsGpaByStuId = async (data) => {
  let { studentId } = data;
  const course_names = [];
  const course_gpa = [];
  //通过学生ID获取该学生所有课程的gpa
  const sql_gpa = `select score_record.gpa,course.* from score_record 
    left join relationship on score_record.relation_id = relationship.id 
    left join course on relationship.course_id = course.id
    where score_record.studentId=${studentId} and score_record.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}`;
  const sql_gpa_res = await exec(sql_gpa);

  sql_gpa_res.map((item) => {
    course_names.push(item.name);
    course_gpa.push(item.gpa);
  });
  return {
    course_names,
    course_gpa,
  };
};
const getStudentsCompletedCourse = async (data) => {
  let { studentId } = data;
  let sql_completed_course = `select course.*,student.name,score_record.gpa,student_work_record.is_completed from student 
                                left join score_record on score_record.studentId = student.id
                                left join relationship on score_record.relation_id=relationship.id
                                left join course on course.id = relationship.course_id
                                left join student_work_record on  student_work_record.relation_id=relationship.id
                                where score_record.studentId=${studentId} and student.id=${studentId} and score_record.gpa is not null and length(score_record.gpa)>0 and student_work_record.is_completed=${1}`;
  const res = await exec(sql_completed_course);

  let sql_unCompleted_course = `select course.*,student.name,score_record.gpa,student_work_record.is_completed from student 
     left join score_record on score_record.studentId = student.id
     left join relationship on score_record.relation_id=relationship.id
     left join course on course.id = relationship.course_id
     left join student_work_record on  student_work_record.relation_id=relationship.id
     where score_record.studentId=${studentId} and student.id=${studentId} and score_record.gpa is not null and length(score_record.gpa)>0 and student_work_record.is_completed=${0}`;
  const res_un = await exec(sql_unCompleted_course);

  return {
    completed: res.length,
    un_completed: res_un.length,
  };
};

const getHomeWorkCompleteRateByClassId = async (data) => {
  let { classId, studentId, level,startTime,endTime } = data;
  const not_completed = [];
  const completed = [];
  let sql_completed_homeWork = `select course.name,student_work_record.is_completed,student.name,student.id,student.stuCode,student.Intake from student
                                  left join class  on  student.class_id = class.id
                                  left join teacher on class.teacher_id = teacher.id
                                  left join organizational on teacher.organizational_id = organizational.id
                                  left join relationship on relationship.organizational_id = organizational.id
                                  left join course on relationship.course_id = course.id
                                  left join student_work_record on student_work_record.relation_id = relationship.id
                                  where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                  and student_work_record.is_deleted=${0}`;

  if(typeof startTime!=='undefined' && typeof endTime!=='undefined'){
    sql_completed_homeWork = `select course.name,student_work_record.is_completed,student.name,student.id,student.stuCode,student.Intake from student
    left join class  on  student.class_id = class.id
    left join teacher on class.teacher_id = teacher.id
    left join organizational on teacher.organizational_id = organizational.id
    left join relationship on relationship.organizational_id = organizational.id
    left join course on relationship.course_id = course.id
    left join student_work_record on student_work_record.relation_id = relationship.id
    where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
    and student_work_record.is_deleted=${0}
    and student_work_record.insert_time>='${startTime}' and student_work_record.insert_time<='${endTime}'
    `;
  }

  if (studentId) {

    sql_completed_homeWork = `
    select course.name,student_work_record.is_completed from class 
                                  left join teacher on class.teacher_id = teacher.id
                                  left join organizational on teacher.organizational_id = organizational.id
                                  left join relationship on relationship.organizational_id = organizational.id
                                  left join course on relationship.course_id = course.id
                                  left join student_work_record on student_work_record.relation_id = relationship.id
                                  where student_work_record.student_id=${studentId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                  and student_work_record.is_deleted=${0}`;
  }
  if (level) {
    sql_completed_homeWork = `select course.name,student_work_record.is_completed,student.name,student.id,student.stuCode,student.Intake from student
    left join class  on  student.class_id = class.id
    left join teacher on class.teacher_id = teacher.id
    left join organizational on teacher.organizational_id = organizational.id
    left join relationship on relationship.organizational_id = organizational.id
    left join course on relationship.course_id = course.id
    left join student_work_record on student_work_record.relation_id = relationship.id
    where class.class='${level}' and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
    and student_work_record.is_deleted=${0}`;
  }
  const res = await exec(sql_completed_homeWork);
  const not_repeat_res = unique(res);

  not_repeat_res.map((item) => {
    if (item.is_completed == 1) {
      completed.push(item);
    }

    if (item.is_completed == 0) {
      not_completed.push(item);
    }
  });

  return {
    completed: completed.length,
    not_completed: not_completed.length,
    not_repeat_res,
  };
};
const getHomeWorkWordCompleteRateByClassId = async (data) => {
  let { classId, studentId, level,startTime,endTime } = data;
  const not_completed = [];
  const completed = [];

  let sql_completed_homeWork = `select course.name,student_work_record.is_upload_word,student.name,student.id,student.stuCode,student.Intake  from student
                                  left join class  on  student.class_id = class.id
                                  left join teacher on class.teacher_id = teacher.id
                                  left join organizational on teacher.organizational_id = organizational.id
                                  left join relationship on relationship.organizational_id = organizational.id
                                  left join course on relationship.course_id = course.id
                                  left join student_work_record on student_work_record.relation_id = relationship.id
                                  where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                  and student_work_record.is_deleted=${0}
   `;
   if(typeof startTime!=='undefined' && typeof endTime!=='undefined'){
    sql_completed_homeWork = `select course.name,student_work_record.is_upload_word,student.name,student.id,student.stuCode,student.Intake  from student
    left join class  on  student.class_id = class.id
    left join teacher on class.teacher_id = teacher.id
    left join organizational on teacher.organizational_id = organizational.id
    left join relationship on relationship.organizational_id = organizational.id
    left join course on relationship.course_id = course.id
    left join student_work_record on student_work_record.relation_id = relationship.id
    where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
    and student_work_record.is_deleted=${0}
    and student_work_record.insert_time>='${startTime}' and student_work_record.insert_time<='${endTime}'
    `
   }
  if (studentId) {
    sql_completed_homeWork = `
    select course.name,student_work_record.is_upload_word from class 
                                  left join teacher on class.teacher_id = teacher.id
                                  left join organizational on teacher.organizational_id = organizational.id
                                  left join relationship on relationship.organizational_id = organizational.id
                                  left join course on relationship.course_id = course.id
                                  left join student_work_record on student_work_record.relation_id = relationship.id
                                  where student_work_record.student_id=${studentId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                  and student_work_record.is_deleted=${0}`;
  }
  if (level) {
    sql_completed_homeWork = `select course.name,student_work_record.is_upload_word,student.name,student.id,student.stuCode,student.Intake  from student
    left join class  on  student.class_id = class.id
    left join teacher on class.teacher_id = teacher.id
    left join organizational on teacher.organizational_id = organizational.id
    left join relationship on relationship.organizational_id = organizational.id
    left join course on relationship.course_id = course.id
    left join student_work_record on student_work_record.relation_id = relationship.id
    where class.class='${level}' and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
    and student_work_record.is_deleted=${0}`;
  }
  const res = await exec(sql_completed_homeWork);
  const not_repeat_res = unique(res);
  not_repeat_res.map((item) => {
    if (item.is_upload_word == 1) {
      completed.push(item);
    }

    if (item.is_upload_word == 0) {
      not_completed.push(item);
    }
  });

  return {
    completed: completed.length,
    not_completed: not_completed.length,
    not_repeat_res,
  };
};
const getHomeWorkVideoCompleteRateByClassId = async (data) => {
  let { classId, studentId,level,startTime,endTime } = data;

  const not_completed = [];
  const completed = [];
  let sql_completed_homeWork = `select course.name,student_work_record.is_upload_video,student.name,student.id,student.stuCode,student.Intake  from student
                                  left join class  on  student.class_id = class.id 
                                  left join teacher on class.teacher_id = teacher.id
                                  left join organizational on teacher.organizational_id = organizational.id
                                  left join relationship on relationship.organizational_id = organizational.id
                                  left join course on relationship.course_id = course.id
                                  left join student_work_record on student_work_record.relation_id = relationship.id
                                  where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                  and student_work_record.is_deleted=${0}
   `;
   if(typeof startTime!=='undefined' && typeof endTime!=='undefined'){
    sql_completed_homeWork = `select course.name,student_work_record.is_upload_video,student.name,student.id,student.stuCode,student.Intake  from student
    left join class  on  student.class_id = class.id 
    left join teacher on class.teacher_id = teacher.id
    left join organizational on teacher.organizational_id = organizational.id
    left join relationship on relationship.organizational_id = organizational.id
    left join course on relationship.course_id = course.id
    left join student_work_record on student_work_record.relation_id = relationship.id
    where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
    and student_work_record.is_deleted=${0}
    and student_work_record.insert_time>='${startTime}' and student_work_record.insert_time<='${endTime}'
    `
   }
  if (studentId) {
    sql_completed_homeWork = `select course.name,student_work_record.is_upload_video from class 
                                  left join teacher on class.teacher_id = teacher.id
                                  left join organizational on teacher.organizational_id = organizational.id
                                  left join relationship on relationship.organizational_id = organizational.id
                                  left join course on relationship.course_id = course.id
                                  left join student_work_record on student_work_record.relation_id = relationship.id
                                  where student_work_record.student_id=${studentId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                  and student_work_record.is_deleted=${0}`;
  }
  if(level){
    sql_completed_homeWork = `select course.name,student_work_record.is_upload_video,student.name,student.id,student.stuCode,student.Intake  from student
                                  left join class  on  student.class_id = class.id 
                                  left join teacher on class.teacher_id = teacher.id
                                  left join organizational on teacher.organizational_id = organizational.id
                                  left join relationship on relationship.organizational_id = organizational.id
                                  left join course on relationship.course_id = course.id
                                  left join student_work_record on student_work_record.relation_id = relationship.id
                                  where class.class='${level}' and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                  and student_work_record.is_deleted=${0}`;
  }
  const res = await exec(sql_completed_homeWork);
  const not_repeat_res = unique(res);
  not_repeat_res.map((item) => {
    if (item.is_upload_video == 1) {
      completed.push(item);
    }

    if (item.is_upload_video == 0) {
      not_completed.push(item);
    }
  });

  return {
    completed: completed.length,
    not_completed: not_completed.length,
    not_repeat_res,
  };
};
const getHomeWorkWordAndVideoCompleteRateByClassId = async (data) => {
  //   let { classId,studentId } = data;
  //   let resWord;
  //   let resVideo;
  //  if(classId){
  //    resWord = await getHomeWorkWordCompleteRateByClassId({ classId });
  //    resVideo = await getHomeWorkVideoCompleteRateByClassId({ classId });
  //  }
  //   if(studentId){
  //      resWord = await getHomeWorkWordCompleteRateByClassId({ studentId });
  //    resVideo = await getHomeWorkVideoCompleteRateByClassId({ studentId });
  //   }
  //   let VideoAndWordCompleted = resWord.completed + resVideo.completed;
  //   let VideoAndWordUnCompleted = resWord.not_completed + resVideo.not_completed;

  //   return {
  //     videoAndWordCompletedStu: [VideoAndWordCompleted, VideoAndWordUnCompleted],
  //     resWord,
  //     resVideo
  //   };
  let { classId, studentId,level,startTime,endTime } = data;

  const VideoAndWordUnCompleted = [];
  const VideoAndWordCompleted = [];
  let sql_completed_homeWork = `select course.name,student_work_record.is_upload_video,student_work_record.is_upload_word,student.name,student.id,student.stuCode,student.Intake  from student
                                left join class  on  student.class_id = class.id 
                                left join teacher on class.teacher_id = teacher.id
                                left join organizational on teacher.organizational_id = organizational.id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on relationship.course_id = course.id
                                left join student_work_record on student_work_record.relation_id = relationship.id
                                where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                and student_work_record.is_deleted=${0}
 `;
 if(typeof startTime!=='undefined' && typeof endTime!=='undefined'){
  sql_completed_homeWork = `select course.name,student_work_record.is_upload_video,student_work_record.is_upload_word,student.name,student.id,student.stuCode,student.Intake  from student
  left join class  on  student.class_id = class.id 
  left join teacher on class.teacher_id = teacher.id
  left join organizational on teacher.organizational_id = organizational.id
  left join relationship on relationship.organizational_id = organizational.id
  left join course on relationship.course_id = course.id
  left join student_work_record on student_work_record.relation_id = relationship.id
  where class.id=${classId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
  and student_work_record.is_deleted=${0}
  and student_work_record.insert_time>='${startTime}' and student_work_record.insert_time<='${endTime}'
`
 }
  if (studentId) {
    sql_completed_homeWork = `select course.name,student_work_record.is_upload_video,student_work_record.is_upload_word from class 
                                left join teacher on class.teacher_id = teacher.id
                                left join organizational on teacher.organizational_id = organizational.id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on relationship.course_id = course.id
                                left join student_work_record on student_work_record.relation_id = relationship.id
                                where student_work_record.student_id=${studentId} and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                and student_work_record.is_deleted=${0}`;
  }
  if(level){
    sql_completed_homeWork = `select course.name,student_work_record.is_upload_video,student_work_record.is_upload_word,student.name,student.id,student.stuCode,student.Intake  from student
                                left join class  on  student.class_id = class.id 
                                left join teacher on class.teacher_id = teacher.id
                                left join organizational on teacher.organizational_id = organizational.id
                                left join relationship on relationship.organizational_id = organizational.id
                                left join course on relationship.course_id = course.id
                                left join student_work_record on student_work_record.relation_id = relationship.id
                                where class.class='${level}' and teacher.is_deleted=${0} and organizational.is_deleted=${0} and relationship.is_deleted=${0} and course.is_deleted=${0}
                                and student_work_record.is_deleted=${0}`;
  }
  const res = await exec(sql_completed_homeWork);
  const not_repeat_res = unique(res);

  not_repeat_res.map((item) => {
    if (item.is_upload_video == 1 && item.is_upload_word == 1) {
      VideoAndWordCompleted.push(item);
    } else {
      VideoAndWordUnCompleted.push(item);
    }
  });

  return {
    videoAndWordCompletedStu: [
      VideoAndWordCompleted.length,
      VideoAndWordUnCompleted.length,
    ],
    not_repeat_res,
  };
};
const getTeachersFromOrganization = async () => {
  //获取所有的机构
  const res = [];
  let sql_organization = `select id as organization_id,name as organization_name from organizational`;
  let organizations = await exec(sql_organization);
  for (let i = 0; i < organizations.length; ++i) {
    let sql_teachers = `select id as value,name as label from teacher where organizational_id=${organizations[i].organization_id}`;
    let teachers = await exec(sql_teachers);
    res.push({
      label: organizations[i].organization_name,
      value: organizations[i].organization_id,
      children: [],
    });
    teachers.forEach((item_teacher) => {
      res[i].children.push({ ...item_teacher });
    });
  }
  return res;
};
module.exports = {
  groupUnqualifiedStudentsBySex,
  groupStudentsByAge,
  groupStudentsQuSituationByScore,
  groupStudentsQuSituationByList,
  groupAllStudentsQuSituationBySex,
  groupAllStudentsQuSituationByAge,
  groupStudentsGpaByStuId,
  getStudentsCompletedCourse,
  getHomeWorkCompleteRateByClassId,
  getHomeWorkWordCompleteRateByClassId,
  getHomeWorkVideoCompleteRateByClassId,
  getHomeWorkWordAndVideoCompleteRateByClassId,
  getTeachersFromOrganization,
  groupGradeStudentsByAge,
  groupGradeStudentsBySex,
  groupGradeStudentsByScore,
  getClassInfo,
};
