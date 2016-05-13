'use strict';


// javascript: (function() {
//     var s = document.createElement('script');
//     s.charset = 'utf-8';
//     s.src = 'http://127.0.0.1:9000/kuaikaotong.js?v=' + new Date().getTime();
//     document.getElementsByTagName('head')[0].appendChild(s);
// })();



$.getScript('http://127.0.0.1:9000/jquery-1.11.1.min.js', function() {

    // var zhangjie = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210];
    //http://www.zhwx.kjkstk.com/ajax4t.php?t=chaptertree&op=pointtree&id=2&len=6
    //
    //
    //

    var sections = [];
    var chapters = [];
    var questions = [];

    var jsonTOcsv = function(name, list) {
        console.log(list);
        var data = {
            list: list,
            name: name
        };
        $.post('http://127.0.0.1:9000/json2csv?organId=xkjy', data, function(data, text) {
            console.log(data);
            if (text === 'success') {

                if (chapters.length) {
                    getQuestionIds(chapters);
                } else {
                    console.log('==================== all done ==========================');
                }
            }
        });
    };

    var typeMap = {
        0: '单选题',
        1: '多选题',
        2: '判读题',
        6: '案例分析题'
    };


    var resultData = function(item, iitem) {
        var obj = {};
        var options = item.options || [];
        if (options.length) {
            // '选项A', '选项B', '选项C', '选项D',
            obj['选项A'] = options[0];
            obj['选项B'] = options[1];
            obj['选项C'] = options[2];
            obj['选项D'] = options[3];
        }

        // '题型', '题干',
        if (!typeMap[item.shititype]) {
            alert('该题型没有配置>>>>>>>>>>>>>  ' + item.shititype);
        }
        obj['题型'] = typeMap[item.shititype];
        obj['题干'] = item.title;

        obj['答案'] = (item.shititype == 6) ? '' : item.answer;
        obj['解析'] = item.demo;
        obj['知识点'] = iitem.chapterName.replace(/\s*/g, '') + iitem.name.replace(/\s*/g, '');

        return obj;
    };

    var childQuestions = function(childs, iitem) {
        iitem.name = '';
        var ary = [];
        $.each(childs, function(i, item) {
            ary.push(resultData(item, iitem));
        });
        return ary;
    };


    var formatQuestions = function(qs) {

        var list = [];

        $.each(qs, function(i, item) {
            $.each(sections, function(j, iitem) {
                var obj = {};
                var point = item.point + '';
                var guid = iitem.guid + '';
                var flag = (point.indexOf(guid) > -1) || (point.length === 3);
                // console.log(flag);
                if (flag) {

                    obj = resultData(item, iitem);
                    // '解析', '知识点'
                    list.push(obj);

                    if (item.shititype == 6) {
                        list = list.concat(childQuestions(item.child, iitem));
                    }
                    return false;
                }
            });


        });

        console.log(qs.length, list.length);

        jsonTOcsv('快考通会计基础章节练习', list);

    };


    var getQuestions = function(qids) {

        var item = qids.shift();
        var qid = item.shitiid;
        var point = item.point;
        // qid = 35214;
        // console.log(qid);
        // if (qid < 35208) {
        //     getQuestions(qids);
        //     return;
        // }
        $.get('http://www.zhwx.kjkstk.com/web2/ajax.php?o=getshiti&qid=' + qid, function(res) {

            if (15237 == qid) {
                res = res.replace('=B2\\C1', '=B2\\\\C1');
            }
            res = JSON.parse(res);
            res.pid = qid;
            res.point = point;

            questions.push(res);

            if (qids.length) {
                getQuestions(qids);
            } else {
                formatQuestions(questions);
            }
        });

    };

    var getQuestionIds = function(chapters) {

        var item = chapters.shift();
        var cid = item.chapterid;
        var point = item.point;
        questions = [];

        $.get('http://www.zhwx.kjkstk.com/web2/ajax.php?o=getpaperinfo&chapterid=' + cid + '&point=' + point, function(data) {

            data = JSON.parse(data);
            var shitiids = data.shitiid;
            var points = data.point;

            var qids = [];

            $.each(shitiids, function(i, item) {

                $.each(points, function(j, iitem) {
                    if (i === j) {
                        qids.push({
                            shitiid: item,
                            point: iitem
                        });
                        return false;
                    }
                });
            });
            getQuestions(qids, item);
        });

    };

    $.get('http://www.zhwx.kjkstk.com/ajax4t.php?t=chaptertree&op=pointtree&id=2&len=6')

    .done(function(data) {

        data = JSON.parse(data);
        var chapterName = '';
        sections = [];

        $.each(data.list || [], function(i, item) {
            if (item.guid > 2000) {
                item.chapterName = chapterName;
                sections.push(item);
            } else {
                chapters.push(item);
                chapterName = item.name;
            }
        });

        getQuestionIds(chapters);

        // return $.get('http://www.zhwx.kjkstk.com/web2/ajax.php?o=getpaperinfo&chapterid=207&point=207');
    });


});
