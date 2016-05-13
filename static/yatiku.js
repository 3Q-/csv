'use strict';


// javascript: (function() {
//     var s = document.createElement('script');
//     s.charset = 'utf-8';
//     s.src = 'http://127.0.0.1:9000/yatiku.js?v=' + new Date().getTime();
//     document.getElementsByTagName('head')[0].appendChild(s);
// })();

// 科目pubid  66 67 68
// pubid:67,
// derive:0
// 获取真题+模考类型列表
// http://old.yatiku.com/exam/GetTypeList

// pubid:66
// derive:258035
// 获取真题+模考列表
// http://old.yatiku.com/exam/GetTypeList

// typeid:257904  试卷id
// http://old.yatiku.com/exam/GetTypeAndPubtypeByid

// id:257749
// testtype:0
// testCategory:
// type:0
// op:0
//http://old.yatiku.com/App/GetTestList  题目列表



// tid:933*1225*1230*1235*1345*1351*1396*1431*1454*1625*1638*1647*1653*1659*1703*1704*1712*1728*1740*1748*1777*1780*1783*1800*1830*1842*1850*1890*1928*1955*1976*1977*2004*2021*2022*2023*2025*2649*2674*2718*2719*2739*2777*2818*2957*2960*3015*3028*3097*3312*3374*3382*3387*3431*3444*3449*3532*3922*3926*3927*3934*3938*3971*3980*3981*3991*4005*4039*4048*
// type:0
// id:0
// http://old.yatiku.com/App/GetTestListModel



var $ = jQuery;

$.getScript('http://127.0.0.1:9000/jquery-1.11.1.min.js', function() {



    var pageNum = 1;
    var paperIds = [];
    var paperMap = [];
    var reg = /\d+$/g;

    var ajax = function(opts, p) {
        var df = $.Deferred();


        opts = $.extend({
            type: 'post'
        }, opts);

        $.ajax(opts)

        .done(function(res) {
            if (p) {
                res.__ = p;
            }
            df.resolve(res);
        })

        .fail(function(xhr, errType, error) {
            df.reject(error);
        });

        return df.promise();

    };


    var typeList = function(sid, s_name) {

        // ajax('http://old.yatiku.com/exam/GetTypeList?pubid=66&derive=0')
        //
        $.when(ajax({
            url: 'http://old.yatiku.com/exam/GetTypeList',
            data: {
                pubid: sid,
                derive: 0
            }
        }))

        .then(function(res) {

            var ary = [];
            var typeid = [];
            $.each(res, function(i, item) {

                ary.push(ajax({
                    url: 'http://old.yatiku.com/exam/GetTypeList',
                    data: {
                        pubid: sid,
                        derive: item.id
                    }
                }));
                typeid.push(item.id);
            });

            console.log('获取科目真题模考类型完毕   ' + JSON.stringify(typeid));

            return $.when.apply(null, ary);

        })

        .then(function() {


            var arg = Array.prototype.slice.call(arguments);



            var ary = [];

            $.each(arg, function(i, item) {



                $.each(item, function(j, iitem) {

                    paperIds.push(iitem.id);
                    ary.push(ajax({
                        url: 'http://old.yatiku.com/exam/GetTypeAndPubtypeByid',
                        data: {
                            typeid: iitem.id
                        }
                    }));
                });
            });

            console.log('获取科目Id完毕    ' + JSON.stringify(paperIds));
            return $.when.apply(null, ary);

        })

        .then(function(res) {

            var arg = Array.prototype.slice.call(arguments);


            var ary = [];

            var ids = [];

            $.each(arg, function(i, item) {

                var data = item[0];

                paperMap.push(data);

                ids.push(data.typeid);

                ary.push(ajax({
                    url: 'http://old.yatiku.com/App/GetTestList',
                    data: {
                        id: data.typeid,
                        testtype: 0,
                        testCategory: '',
                        type: 0,
                        op: 0
                    }
                }));
            });



            console.log('创建答题卡完毕    ' + JSON.stringify(ids));
            return $.when.apply(null, ary);

        })

        .then(function() {

            ///exam/startExam/" + typeid + "/" + thelength + "/" + pubid + "/0/0
            var arg = Array.prototype.slice.call(arguments);

            console.log('获取题目列表完毕   ' + JSON.stringify(arg));

            console.log(arg);
            var ary = [];

            $.each(arg, function(i, item) {

                console.log(item);
                if (item.length) {
                    ary.push(ajax({
                        url: 'http://old.yatiku.com/App/GetTestListModel',
                        data: {
                            tid: item.join('*'),
                            type: 0,
                            id: 0
                        }
                    }));
                }

            });

            return $.when.apply(null, ary);


        })

        .then(function() {

            var arg = Array.prototype.slice.call(arguments);
            console.log('获取题目数据完毕   ');
            console.log(arg);



            var questionType = {
                "2": "单选题",
                "9": "多选题",
                "1": "判断题",
                "0": "简答题"
            };


            var index = 0;
            var reg = /(<\/?p>|<\/?div>|<br>|\r|\n)/img;
            var splitreg = /[a-dA-D][.\-?]/g;
            var go = function() {

                var item = arg.shift();

                var array = [];
                $.each(item, function(j, iitem) {

                    var test = [];
                    var descrip = '';
                    var flag = true;
                    var answer = (iitem.style === 1) ? (iitem.answer === '√' ? '正确' : '错误') : iitem.answer;

                    if (iitem.style === 2 || iitem.style === 9) {

                        if (iitem.descrip) {
                            descrip = iitem.descrip.replace(reg, '').split(splitreg);
                            descrip.shift();
                            test.push(iitem.test.replace(reg, ''));
                            test.push.apply(test, descrip);
                        } else {
                            test = iitem.test.replace(reg, '').split(splitreg);
                        }

                        if (test.length !== 5) {
                            flag = false;
                            console.log(test.length, '---------该选择题没有答案');
                            console.log(iitem);
                        }

                    } else {
                        test.push(iitem.test.replace(reg, ''));
                    }



                    var csv = {
                        '题型': questionType[iitem.style],
                        '题干': test[0],
                        '选项A': test[1] || '',
                        '选项B': test[2] || '',
                        '选项C': test[3] || '',
                        '选项D': test[4] || '',
                        '答案': answer,
                        '解析': iitem.explain.replace('【答案】', ''),
                        '知识点': paperMap[index].typename
                    };

                    if (flag) {
                        array.push(csv);
                    }

                });


                var data = {
                    list: array,
                    name: s_name
                };

                $.post('http://127.0.0.1:9000/json2csv?organId=xkjy', data, function(data, text) {

                    if (arg.length) {
                        index++;
                        console.log(text);
                        go();
                    } else {

                        console.log('-----------   done  -------------');
                    }

                });
            };

            go();


        });

    };

    // typeList(68, '鸭题库-中级经济法');
    // typeList(67, '鸭题库-中级会计实务');
    // typeList(66, '鸭题库-中级财务管理');


    var chapter = function(sid, s_name) {

        // ajax('http://old.yatiku.com/exam/GetTypeList?pubid=66&derive=0')

        $.when(ajax({
            url: 'http://old.yatiku.com/iframe/GetChapterAjax',
            data: {
                id: 0,
                dg: 0,
                type: 0,
                SelectType: 0
            }
        }))

        .then(function(res) {


            var html = $('<div></div>');

            html.append($(res));


            var ary = [];


            html.find('li').each(function(i, item) {


                var ele = $(this);

                var text = ele.find('h1').text();

                var length = ele.find('a').attr('onclick').split(',')[2];
                var id = this.id;
                paperMap.push({
                    id: id,
                    length: length,
                    name: text
                });

                ary.push(ajax({
                    url: 'http://old.yatiku.com/App/GetTestList',
                    data: {
                        id: id,
                        testtype: 0,
                        testCategory: '',
                        type: 0,
                        op: 0
                    }
                }));

            });



            return $.when.apply(null, ary);

        })



        .then(function() {

            ///exam/startExam/" + typeid + "/" + thelength + "/" + pubid + "/0/0
            var arg = Array.prototype.slice.call(arguments);

            console.log('获取题目列表完毕   ' + JSON.stringify(arg));


            var ary = [];
            $.each(arg, function(i, item) {

                if (item.length) {

                    ary.push(ajax({
                        url: 'http://old.yatiku.com/App/GetTestListModel',
                        data: {
                            tid: item.join('*'),
                            type: 0,
                            id: 0
                        }
                    }));
                }

            });

            return $.when.apply(null, ary);


        })

        .then(function() {

            var arg = Array.prototype.slice.call(arguments);
            console.log('获取题目数据完毕   ');
            console.log(arg);



            var questionType = {
                "2": "单选题",
                "9": "多选题",
                "1": "判断题",
                "0": "简答题"
            };


            var index = 0;
            var reg = /(<\/?p>|<\/?div>|<br>|\r|\n)/img;
            var splitreg = /[a-dA-D][.\-?]/g;
            var go = function() {

                var item = arg.shift();

                var array = [];
                $.each(item, function(j, iitem) {

                    var test = [];
                    var descrip = '';
                    var flag = true;
                    var answer = (iitem.style === 1) ? (iitem.answer === '√' ? '正确' : '错误') : iitem.answer;

                    if (iitem.style === 2 || iitem.style === 9) {

                        if (iitem.descrip) {
                            descrip = iitem.descrip.replace(reg, '').split(splitreg);
                            descrip.shift();
                            test.push(iitem.test.replace(reg, ''));
                            test.push.apply(test, descrip);
                        } else {
                            test = iitem.test.replace(reg, '').split(splitreg);
                        }

                        if (test.length !== 5) {
                            flag = false;
                            console.log(test.length, '---------该选择题没有答案');
                            console.log(iitem);
                        }

                    } else {
                        test.push(iitem.test.replace(reg, ''));
                    }



                    var csv = {
                        '题型': questionType[iitem.style],
                        '题干': test[0],
                        '选项A': test[1] || '',
                        '选项B': test[2] || '',
                        '选项C': test[3] || '',
                        '选项D': test[4] || '',
                        '答案': answer,
                        '解析': iitem.explain.replace('【答案】', ''),
                        '知识点': paperMap[index].name
                    };

                    if (flag) {
                        array.push(csv);
                    }

                });


                var data = {
                    list: array,
                    name: s_name
                };

                $.post('http://127.0.0.1:9000/json2csv?organId=xkjy', data, function(data, text) {

                    if (arg.length) {
                        index++;
                        console.log(text);
                        go();
                    } else {

                        console.log('-----------   done  -------------');
                    }

                });
            };

            go();


        });

    };

    chapter(68, '鸭题库-章节练习-中级经济法');
    // chapter(67, '鸭题库-章节练习-中级会计实务');
    // chapter(66, '鸭题库-章节练习-中级财务管理');
});
