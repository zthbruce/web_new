/**
 * Created by Fly on 2016-03-03.
 */






var Utils = function(){

    this.eid0 = '{"eid":0}';
    this.eid1 = '{"eid":1, msg:"database exception"}';
    this.eid2 = '{"eid":2, msg:"err"}';
    this.eid100 = '{"eid":100, msg:"not found detail info by id"}';

    this.getUploadFilePath = function(){
        //若是在webstorm下运行
        //return  "./public/multi-media/";
        //若是在cmd命令行下运行
        return "./../public/multi-media/";
    }
    this.getUploadFilePath_parts = function(){
        //若是在webstorm下运行
        //return  "./public/multi-media/";
        //若是在cmd命令行下运行
        return "./../public/parts_pic/";
    }
    this.getUploadFilePath_equip = function(){
        //若是在webstorm下运行
        //return  "./public/multi-media/";
        //若是在cmd命令行下运行
        return "./../public/equip_pic/";
    }
    this.getDownloadFilePath = function(){
        //若是在webstorm下运行
        //return  "./public/exportfiles/";
        //若是在cmd命令行下运行
        //return "192.168.129.180:10002/multi-media/";
        return "127.0.0.1:3000/multi-media/";
    }

    /**
     * 数组对象转换为sql串里的in str
     * @param arr
     * @returns string
     */
    this.arr2instr = function(arr){
        var str = ""
        for(var i = 0; i < arr.length; i++){
            if (i > 0) str +=",";
            str += "'"+arr[i]+"'";
        }
        return str;
    }

    /**
     * null对象转换为空串，否则返回原对象
     * @param obj
     * @returns {}
     */
    this.null2str = function (obj)
    {
        if(this.isEmpty(obj)) return "";
        return obj;
    }

    /**
     * null对象转换为0，否则返回原对象
     * @param obj
     * @returns {}
     */
    this.null2zero = function (obj)
    {
        if(this.isEmpty(obj))return 0;
        return obj;
    }
    /**
     * 判断非空
     * @param obj
     * @returns {boolean}
     */
    this.isEmpty = function (obj) {
        if (obj == undefined || obj == null || new String(obj).trim() == '' || new String(obj).trim() == 'undefined') {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 判断非空
     * @param obj
     * @returns {boolean}
     */
    this.isNotEmpty = function (obj) {
        return this.isEmpty(obj) ? false : true;
    }
    /**
     * 获取字符串真实长度 汉字算两位
     * @param str
     * @returns {number}
     */
    this.getRealLength = function (str) {
        return isEmpty(str) ? 0 : str.replace(/[^\x00-\xff]/g, "**").length;
    }
    var class2type = {}, toString = Object.prototype.toString;
    (function () {
        var typeArr = "Boolean,Number,String,Function,Array,Date,RegExp,Object".split(",");
        for (var i = 0; i < typeArr.length; i++) {
            var name = typeArr[i];
            class2type["[object " + name + "]"] = name.toLowerCase();
        }
    })()
    /**
     * 判断参数类型
     * @param obj
     * @returns {string}
     */
    function type(obj) {
        return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
    }
    /**
     * 判断参数是否为布尔类型
     * @param obj
     * @returns {boolean}
     */
    this.isBoolean = function (obj) {
        return isEmpty(obj) ? false : type(obj) === 'boolean';
    }
    /**
     * 判断参数是否为数字类型
     * @param obj
     * @returns {boolean}
     */
    this.isNumeric = function (obj) {
        return this.isEmpty(obj) ? false : type(obj) === 'number';
    }
    this.isString = function (obj) {
        return this.isEmpty(obj) ? false : type(obj) === 'string';
    }
    this.isFunction = function (obj) {
        return this.isEmpty(obj) ? false : type(obj) === 'function';
    }
    this.isArray = function (obj) {
        return this.isEmpty(obj) ? false : type(obj) === 'array';
    }
    this.isDate = function (obj) {
        return this.isEmpty(obj) ? false : type(obj) === 'date';
    }
    this.isRegExp = function (obj) {
        return this.isEmpty(obj) ? false : type(obj) === 'regexp';
    }
    this.isObject = function (obj) {
        return this.isEmpty(obj) ? false : type(obj) === 'object';
    }

    //AA ->AB
    this.letterAdd = function (str)
    {
        if(str.charCodeAt(1) == 90)
        {
            str = String.fromCharCode(str.charCodeAt(0)+1,65);
        }else{
            str = String.fromCharCode(str.charCodeAt(0),str.charCodeAt(1)+1);
        }

        return str;
    }

    // 000001 ->000002
    this.SixDigitAdd=function (str)
    {
        var num=Number(str);
        num=num+1;
        if(num<10){str='00000'+''+String(num);}
        else if(num<100){str='0000'+''+String(num);}
        else if(num<1000){str='000'+''+String(num);}
        else if(num<10000){str='00'+''+String(num);}
        else if(num<100000){str='0'+''+String(num);}
        else{str=String(num);}
        return str;
    }
    return this;
};
var utils = new Utils();
module.exports = utils;