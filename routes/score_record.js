var express = require("express");
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel");
const getTableCount = require("../middleware/getTableCount");
const { pageSize } = require("../conf/page");
const {getScore,createScore,delScore,updateScore,getScoreRank,getScoreListByStudent,createCommonText,getCommonText,delCommonText,queryWorkinfoByScored,createExpertAdviseRecord,readOk} = require('../controller/score_record')
router.get('/get',(req,res,next)=>{
    let {studentId,relation_id,id,curPage} = req.query;
    let result = getScore(studentId,relation_id,id,curPage);
    result.then((data) => {
      res.json(new SuccessModel(data, data.totalPageNum));
      });
  
})

router.post('/new',(req,res,next)=>{
    
    const result = createScore(req.body);
    return result.then((data) => {
        res.json(new SuccessModel(data));
      }).catch(err=>{
        res.json(new ErrorModel(err));
      });
})
router.post('/update',(req,res,next)=>{
    const result = updateScore(req.body);
    return result.then((data) => {
     
      if (!data) {
        res.json(new ErrorModel(data));
      }
      res.json(new SuccessModel(data));
    }).catch(err=>{
      res.json(new ErrorModel(err));
    });
})
router.get('/scoreRank',(req,res,next)=>{
  const result = getScoreRank(req.query);

  return result.then(data=>{
   res.json(new SuccessModel(data));
  })
})
router.post('/del',(req,res,next)=>{
    const result = delScore(req.body.id);
    return result.then((val) => {
      if (val) {
        res.json(new SuccessModel(val));
      } else {
        res.json(new ErrorModel("删除成绩失败"));
      }
    }).catch(err=>{
      res.json(new ErrorModel(err));
    });
}
)


router.get('/readOk',(req,res,next)=>{
	console.log(readOk)
    const result = readOk(req.query.id);
    return result.then((val) => {
      if (val) {
        res.json(new SuccessModel(val));
      } else {
        res.json(new ErrorModel("删除成绩失败"));
      }
    }).catch(err=>{
      res.json(new ErrorModel(err));
    });
}
)


router.get('/getScoreListByStudent',  (req,res,next)=>{
	//req.body = {"studentId":1,"is_up_to_standard":1}
	console.log(req.query)
    const result = getScoreListByStudent(req.query);
	return result.then(data=>{
		//console.log(new SuccessModel(data)
		res.json(new SuccessModel(data));
    })
})



router.get('/getCommonText',(req,res,next)=>{
   let {username,type} = req.query;
   console.log(username)
   let result = getCommonText(username,type);
   result.then((data) => {
    res.json(new SuccessModel(data, data.totalPageNum));
   });
})


router.post('/createCommonText',(req,res,next)=>{
  console.log(req.body)
    const result = createCommonText(req.body);
    
    return result.then((data) => {
      
        res.json(new SuccessModel(data));
      }).catch(err=>{
        res.json(new ErrorModel(err));
      });
})


router.post('/createExpertAdviseRecord',(req,res,next)=>{
  console.log(req.body)
    const result = createExpertAdviseRecord(req.body);
    
    return result.then((data) => {
      
        res.json(new SuccessModel(data));
      }).catch(err=>{
        res.json(new ErrorModel(err));
      });
})



router.post('/delCommonText',(req,res,next)=>{
	
    const result = delCommonText(req.body);
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



router.get('/queryWorkinfoByScored',(req,res,next)=>{
   console.log(req.query)
   let {scoreId} = req.query;
   let result = queryWorkinfoByScored(scoreId);
   result.then((data) => {
    res.json(new SuccessModel(data, data.totalPageNum));
   });
})


module.exports = router