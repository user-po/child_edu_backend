var express = require("express");
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel");
const {
  getClass,
  delClass,
  createClass,
  updateClass,
  getAllStudents
} = require("../controller/class");

const getTableCount = require("../middleware/getTableCount");
const { pageSize } = require("../conf/page");
router.get("/get", (req, res, next) => {
  let result = getClass(req.query);

  result.then((data) => {
    let additional = data.absence_num;
    res.json(new SuccessModel(data,data.totalPageNum,data.teachers,additional));
  });
});
router.post("/new", (req, res, next) => {
  const result = createClass(req.body);

  return result.then((data) => {
    res.json(new SuccessModel(data));
  }).catch(err=>{
    res.json(new ErrorModel(err));
  });
});
router.post("/update", (req, res, next) => {
  const result = updateClass(req.body);

  return result.then((data) => {
    res.json(new SuccessModel(data));
  }).catch(err=>{
    res.json(new ErrorModel(err));
  });
});
router.get("/getAllStudents",(req,res,next)=>{
  const result = getAllStudents(req.query);

  return result.then((data) => {
    res.json(new SuccessModel(data));
  }).catch(err=>{
    res.json(new ErrorModel(err));
  });
})
router.post("/del", (req, res, next) => {
  const result = delClass(req.body.id);
  return result.then((val) => {
    if (val) {
      res.json(new SuccessModel(val));
    } else {
      res.json(new ErrorModel("删除班级失败"));
    }
  }).catch(err=>{
    res.json(new ErrorModel(err));
  });
});

module.exports = router;
