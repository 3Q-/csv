'use strict';


// javascript: (function() {
//     var s = document.createElement('script');
//     s.charset = 'utf-8';
//     s.src = 'http://127.0.0.1:9000/233.js?v=' + new Date().getTime();
//     document.getElementsByTagName('head')[0].appendChild(s);
// })();

var $ = jQuery;

$.getScript('http://127.0.0.1:9000/jquery-1.11.1.min.js', function() {



    var pageNum = 1;
    var paperIds = [];
    var reg = /\d+$/g;

    var ajax = function(opts) {
        var df = $.Deferred();

        $.ajax(opts)

        .done(function(res) {
            df.resolve(res);
        })

        .fail(function(xhr, errType, error) {
            df.reject(error);
        });

        return df.promise();

    };

    var getPaperIds = function() {

        $.get('http://wx.233.com/tiku/exam/30-38-0-0-0-0p=' + pageNum)

        .done(function(data) {

            var html = $(data).find('.examList-data');


            html.find('.zt-go').each(function(i, item) {

                var href = item.href;
                var str = href.match(reg);

                paperIds.push(str[0]);

            });

            if (pageNum < 20) {
                pageNum++;
                getPaperIds();
            } else {
                //  得到的id放的233.json里面
                console.log(JSON.stringify(paperIds));
                console.log('___________ all done ______');

                //
            }

        });

    };

    // getPaperIds();


    var doPaper = function() {
        //创建答题卡
        //http://wx.233.com/search/UserCenter/jk/acc/?paperid=341789

        // 交卷
        //http://wx.233.com/search/UserCenter/jk/cy/server/exam.asp?act=finish&paperId=341913&examTime=2000000000&_=1462950663660".

        // 答案页面
        //http://wx.233.com/search/UserCenter/jk/acc/do.asp?ref=30.341549#1
        //

        $.getScript('http://127.0.0.1:9000/233.json.js', function() {

            var paperIdList = window.paperMap['中级财务管理'];

            var createPaper = function() {

                var item = paperIdList.shift();

                $.post('http://wx.233.com/tiku/Exam/PayPaper/', {
                    paperId: item,
                    modelStr: 'jk'
                })

                .done(function(res) {
                    console.log(res, item);
                    if (paperIdList.length) {
                        createPaper();
                    }

                });
            };
            createPaper();

        });

    };


    // doPaper();
    //


    var submitPaper = function() {

        $.getScript('http://127.0.0.1:9000/233.json.js', function() {

            var paperIdList = window.paperMap['中级会计实务'];
            console.log(paperIdList);

            var createPaper = function() {

                var item = paperIdList.shift();
                console.log(item);
                $.get('http://wx.233.com/search/UserCenter/jk/cy/server/exam.asp', {
                    act: 'finish',
                    paperId: item,
                    examTime: 2000000
                })

                .done(function(res) {



                    console.log(res);
                    if (paperIdList.length) {
                        createPaper();
                    }

                });
            };
            createPaper();

        });
    };
    // submitPaper();



    var getQuestionIds = function(subjectname) {
        $.getScript('http://127.0.0.1:9000/233.json.js', function() {

            var paperIdList = window.paperMap[subjectname];

            var unsuccessPaperIds = [];

            var createPaper = function() {

                var item = paperIdList.shift();

                $.get('http://wx.233.com/search/UserCenter/jk/acc/do.asp?ref=30.' + item + '#1')

                .done(function(res) {


                    if (res === '�����Ծ���֧�ֻ���ģʽ') {

                        console.log(item + ' paperId 不支持机考');
                        unsuccessPaperIds.push(item);
                        createPaper();
                        return;
                    }

                    var html = $(res).find('#dom-examCart');
                    var title = /<TITLE>(.*)<\/TITLE>/img.exec(res);

                    title = title[1].split('-')[0];

                    // http://wx.233.com/search/UserCenter/jk/cy/server/exam.asp?act=view&paperId=611&rulesId=2559
                    var ary = [];
                    var listData = [];

                    html.find('>dl').each(function(i) {
                        var ele = $(this);
                        var data = ele.data();
                        var rulesId = ele.data('rulesid');
                        var rulestitle = ele.data('rulestitle');
                        //unescape
                        listData.push(data);

                        ary.push(ajax('http://wx.233.com/search/UserCenter/jk/cy/server/exam.asp?act=view&paperId=' + item + '&rulesId=' + rulesId));

                        // ary.push($.get('http://wx.233.com/search/UserCenter/jk/cy/server/exam.asp?act=view&paperId=' + item + '&rulesId=' + rulesId));
                    });


                    $.when.apply(null, ary)

                    .done(function() {

                        var arg = Array.prototype.slice.call(arguments);

                        //['题型', '题干', '选项A', '选项B', '选项C', '选项D', '答案', '解析', '知识点'];
                        var json = [];
                        $.each(arg, function(i, iitem) {

                            var data = JSON.parse(iitem);


                            $.each(data.ExamList, function(j, iiitem) {

                                var csv = {
                                    '题型': unescape(listData[i].rulestitle),
                                    '题干': unescape(iiitem.Content).replace(/(\n|\t|&nbsp;|<\/?div>)/img, ''),
                                    '选项A': unescape(iiitem.ExamOption[0] || '').replace(/,/g, ''),
                                    '选项B': unescape(iiitem.ExamOption[1] || '').replace(/,/g, ''),
                                    '选项C': unescape(iiitem.ExamOption[2] || '').replace(/,/g, ''),
                                    '选项D': unescape(iiitem.ExamOption[3] || '').replace(/,/g, ''),
                                    '答案': unescape(iiitem.sysAnswer),
                                    '解析': unescape(iiitem.Analysis).replace(/(\n|\t|&nbsp;|<\/?div>)/img, '').replace(/233网校名师答案：(.*233网校答案解析：)?/g, ''),
                                    '知识点': title
                                };
                                json.push(csv);
                            });
                        });

                        var jsonTOcsv = function() {

                            var data = {
                                list: json,
                                name: subjectname
                            };

                            $.post('http://127.0.0.1:9000/json2csv?organId=xkjy', data, function(data, text) {

                                if (paperIdList.length) {
                                    createPaper();
                                } else {
                                    console.log('不支持机考   ' + JSON.stringify(unsuccessPaperIds));
                                    console.log('-----------   done  -------------');
                                }

                            });
                        };

                        jsonTOcsv();

                    });


                });
            };
            createPaper();

        });
    };
    getQuestionIds('中级会计实务');



});
