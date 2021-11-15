var express = require("express");
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel");
const {
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
    getClassInfo
  } = require("../controller/DataAnalysis");

router.get('/groupStudentsQuSituationBySex',(req,res,next)=>{

    let result = groupUnqualifiedStudentsBySex(req.query);
  
    return result.then(data=>{
      res.json(new SuccessModel(data));
     
    })
   
})
router.get('/groupStudentsByAge',(req,res,next)=>{

    let result = groupStudentsByAge(req.query);
    
    return result.then(data=>{
    
      res.json(new SuccessModel(data));
    })
   
})
router.get('/groupGradeStudentsByScore',(req,res,next)=>{

  let result = groupGradeStudentsByScore(req.query);
  
  return result.then(data=>{
  
    res.json(new SuccessModel(data));
  })
 
})
router.get('/getClassInfo',(req,res,next)=>{

  let result = getClassInfo(req.query);
  
  return result.then(data=>{
  
    res.json(new SuccessModel(data));
  })
 
})
router.get('/groupGradeStudentsByAge',(req,res,next)=>{

  let result = groupGradeStudentsByAge(req.query);
  
  return result.then(data=>{
  
    res.json(new SuccessModel(data));
  })
 
})
router.get('/groupGradeStudentsBySex',(req,res,next)=>{

  let result = groupGradeStudentsBySex(req.query);
  
  return result.then(data=>{
  
    res.json(new SuccessModel(data));
  })
 
})
router.get('/groupStudentsQuSituationByScore',(req,res,next)=>{

    let result = groupStudentsQuSituationByScore(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
   
})
router.get('/groupStudentsQuSituationByList',(req,res,next)=>{

    let result = groupStudentsQuSituationByList(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
   
})

router.get('/groupAllStudentsQuSituationBySex',(req,res,next)=>{
    let result = groupAllStudentsQuSituationBySex(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/groupAllStudentsQuSituationByAge',(req,res,next)=>{
    let result = groupAllStudentsQuSituationByAge(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/groupStudentsGpaByStuId',(req,res,next)=>{
    let result = groupStudentsGpaByStuId(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/groupStudentsGpaByStuId',(req,res,next)=>{
    let result = groupStudentsGpaByStuId(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/getStudentsCompletedCourse',(req,res,next)=>{
    let result = getStudentsCompletedCourse(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/getHomeWorkCompleteRateByClassId',(req,res,next)=>{
    let result = getHomeWorkCompleteRateByClassId(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/getHomeWorkWordCompleteRateByClassId',(req,res,next)=>{
    let result = getHomeWorkWordCompleteRateByClassId(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/getHomeWorkVideoCompleteRateByClassId',(req,res,next)=>{
    let result = getHomeWorkVideoCompleteRateByClassId(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/getHomeWorkWordAndVideoCompleteRateByClassId',(req,res,next)=>{
    let result = getHomeWorkWordAndVideoCompleteRateByClassId(req.query);
  
    return result.then(data=>{
      
      res.json(new SuccessModel(data));
    })
})
router.get('/getTeachersFromOrganization',(req,res,next)=>{
  let result = getTeachersFromOrganization(req.query);

  return result.then(data=>{
    
    res.json(new SuccessModel(data));
  })
})
module.exports = router;