var express = require("express");
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel");
const getTableCount = require("../middleware/getTableCount");
const { pageSize } = require("../conf/page");
const {getCourse,createCourse,delCourse,updateCourse,getCourseDetail,getSoreDataOfStudent,getHomeWorkDetail} = require('../controller/course')

router.get('/get',(req,res,next)=>{
   let {code,name,id,curPage,query} = req.query;
  
   let result = getCourse(id,code,name,curPage,query);
   result.then((data) => {
    res.json(new SuccessModel(data, data.totalPageNum));
     });
})

router.get('/courseSeniorSearch',(req,res,next)=>{
	let {types,classes} = req.query;
  
   let result = courseSeniorSearch(types,classes);
   result.then((data) => {
    res.json(new SuccessModel(data));
     });
})
router.post('/new',(req,res,next)=>{
  
    const result = createCourse(req.body);
    console.log(result)
    return result.then((data) => {
      
        res.json(new SuccessModel(data));
      }).catch(err=>{
        res.json(new ErrorModel(err));
      });
})
router.post('/update',(req,res,next)=>{
    const result = updateCourse(req.body);
    return result.then((data) => {
     
      if (!data) {
        res.json(new ErrorModel(data));
      }
      res.json(new SuccessModel(data));
    }).catch(err=>{
      
      res.json(new ErrorModel(err));
    });
})
router.get('/detail',(req,res,next)=>{
  const result = getCourseDetail(req.query);

  return result.then(data=>{
    res.json(new SuccessModel(data));
  })
})


//获取当前学生已达标和未达标课程列表数据

router.get('/getUpStandDataOrNoUpstandData',  (req,res,next)=>{
	//req.body = {"studentId":1,"is_up_to_standard":1}
	
	
    const result = getSoreDataOfStudent(req.query);

	return result.then(data=>{
		
		//console.log(new SuccessModel(data)
		res.json(new SuccessModel(data));
    })
})





router.post('/del',(req,res,next)=>{
    const result = delCourse(req.body.id);
    return result.then((val) => {
      if (val) {
        res.json(new SuccessModel(val));
      } else {
        res.json(new ErrorModel("删除课程失败"));
      }
    }).catch(err=>{
      res.json(new ErrorModel(err));
    });
})




//获取作业信息

router.get('/getHomeWorkDetail',  (req,res,next)=>{
	//req.body = {"homeWorkId":1,"is_up_to_standard":1}
    const result = getHomeWorkDetail(req.query);
	return result.then(data=>{
		
		//console.log(new SuccessModel(data)
		res.json(new SuccessModel(data));
    })
})


module.exports = router;