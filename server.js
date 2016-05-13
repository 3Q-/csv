'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var json2csv = require('json2csv');
var fs = require('fs');
var iconv = require('iconv-lite');

app.use(express.static(path.join(__dirname, 'static')));

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 100000
}));


app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


var fields = ['题型', '题干', '选项A', '选项B', '选项C', '选项D', '答案', '解析', '知识点'];
var kemu = {};

var formatData = {

    parseItem: function(str) {
        str = str || '';
        return str.replace(/(\n|\t)/img, '');
    },

    xkjy: function(ary) {

        var dataMap = {};

        var resultData = function(obj) {

            if (obj.type === '3') {
                obj.result = obj.result === 'T' ? '正确' : '错误';
            }

            if (obj.type === '5' || obj.type === '6') {
                obj.code = obj.code + '-' + new Date().getTime();
            }

            return {
                '题型': obj.subjectTypeName,
                '选项A': formatData.parseItem(obj['an1']),
                '选项B': formatData.parseItem(obj['an2']),
                '选项C': formatData.parseItem(obj['an3']),
                '选项D': formatData.parseItem(obj['an4']),
                '解析': formatData.parseItem(obj.analysis),
                '答案': formatData.parseItem(obj.result),
                '题干': formatData.parseItem(obj.content),
                '知识点': formatData.parseItem(obj.code)
            };
        };

        var sortResult = function(data) {
            var result = data.result || '';

            result = result.replace(/;$/g, '');

            var itemAry = [];
            result.split(';').forEach(function(item) {

                var iitemAry = [];
                item.split('|').forEach(function(iitem, i) {

                    if (i === 1) {
                        iitem = kemu[iitem];
                    }
                    iitemAry.push(iitem);
                });

                itemAry.push(iitemAry.join('|'));
            });

            data.result = itemAry.join(';');

        };

        var childQuestions = function(subjects) {

            var array = [];

            subjects.forEach(function(item) {

                sortResult(item);

                if (item.subjectTypeName === '多选题') {

                    item.result = item.result.replace(/;/g, '');
                }
                array.push(resultData(item));
            });
            return array;
        };


        var array = new Array(30);

        ary.forEach(function(item, i) {

            var obj = item;

            var type = +obj.type;

            var subjectTypeName = obj.subjectTypeName;
            if (!array[type]) {

                array[type] = [resultData(obj)];

            } else {

                array[type].push(resultData(obj));
            }

            if (!dataMap[subjectTypeName]) {
                dataMap[subjectTypeName] = [resultData(obj)];
            } else {
                dataMap[subjectTypeName].push(resultData(obj));
            }


            if (obj.type === '6' || obj.type === '5') {
                array[type] = array[type].concat(childQuestions(obj.subjects));
                dataMap[subjectTypeName] = dataMap[subjectTypeName].concat(childQuestions(obj.subjects));
            }

        });


        // return
        var dataAry = [];
        array.forEach(function(item) {
            // console.log(item && item.length > 0);
            // console.log(item);
            // console.log('===================================xia=================================');
            if (item && item.length > 0) {
                dataAry = dataAry.concat(item);
            }
        });

        dataMap = {
            dataAry: dataAry
        };

        // console.log(array);
        return dataMap;
    }
};

app.post('/json2csv', function(req, res) {

    kemu = req.body.kemu;

    var name = req.body.name,
        organId = req.query.organId,
        list = req.body.list;


    var data = formatData[organId](list);

    for (var o in data) {

        var item = data[o];

        json2csv({
            data: item,
            fields: fields
        }, function(err, csv) {
            if (err) {

                console.log(err);
            }

            var newCsv = iconv.encode(csv, 'GBK');

            // var fileTitle = (item[0]['知识点'].replace(/\s+/img, '') + '-' + item[0]['题型']);
            var fileTitle = name || new Date.getTime();
            var filePath = path.join(__dirname, 'csv', fileTitle + '.csv');

            fs.writeFileSync(path.join(__dirname, 'csv', '会计基础 模考' + '.csv'), newCsv, {
                flag: 'a'
            });

            console.log(filePath + '  >>>>>>>>>>>>>>>>> 生成成功>>>>>>>>>>>>>>>>');
        });
    }

    res.send(name + '生成成功');

    // res.end(res.statusCode.toString());
});


app.get('/', function(req, res) {
    res.send('Hello world! sjfksfjkas');
});


app.get('/about', function(req, res) {
    res.send('Hello world! about');
});


console.log('server run at 9000');

app.listen(9000);
