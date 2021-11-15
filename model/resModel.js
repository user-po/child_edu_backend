class BaseModel {
  constructor(data, count,teachers,additional) {
    if (typeof data === "string") {
      throw new Error("two String params,only one params");
    }
    if (typeof data === "string") {
      this.message = data;
      data = null;
      message = null;
      count = null;
    }
    if (data) {
 
      this.data = data;
    }
    // if (message) {
    //   this.message = message;
    // }
    if(teachers){
      
          this.teachers = teachers
    }
    if (count) {
      this.totalPageNum = count;
    }
    if(typeof additional !== 'undefined'){

      this.additional = additional;
    }
  }
}

class SuccessModel extends BaseModel {
  constructor(data, count,teachers,additional) {
    super(data, count,teachers,additional);
    this.errno = 0;
    this.sqlerr = 0;
  }
}
class ErrorModel extends BaseModel {
  constructor(data, count, message) {
    super(data, count, message);
    this.errno = -1;
    this.sqlerr = -1;
  }
}

module.exports = {
  SuccessModel,
  ErrorModel,
};
