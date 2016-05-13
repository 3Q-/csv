'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var json2csv = require('json2csv');
var fs = require('fs');
var iconv = require('iconv-lite');
var request = require('request');

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

app.post('/json2csv', function(req, res) {

    var name = req.body.name;
    var data = req.body.list;


    console.log(name);
    console.log(data);

    json2csv({
        data: data,
        fields: fields
    }, function(err, csv) {
        if (err) {
            console.log(err);
        }

        var newCsv = iconv.encode(csv, 'GBK');
        var filePath = path.join(__dirname, 'csv', name + '.csv');

        fs.writeFileSync(filePath, newCsv, {
            flag: 'a'
        });

        console.log(filePath + '  >>>>>>>>>>>>>>>>> 生成成功 >>>>>>>>>>>>>>>> 共有题目 ' + data.length + '  道');
        res.send(filePath + '  >>>>>>>>>>>>>>>>> 生成成功 >>>>>>>>>>>>>>>>');
    });

});




app.get('/', function(req, res) {
    res.send('Hello world! sjfksfjkas');
});


app.get('/about', function(req, res) {
    res.send('Hello world! about');
});


console.log('server run at 9000');

app.listen(9000);
