'use strict';


// javascript: (function() {
//     var s = document.createElement('script');
//     s.charset = 'utf-8';
//     s.src = 'http://127.0.0.1:9000/xkjy.js?v=' + new Date().getTime();
//     document.getElementsByTagName('head')[0].appendChild(s);
// })();


$.getScript('http://127.0.0.1:9000/jquery-1.11.1.min.js', function() {

    $.getScript('http://127.0.0.1:9000/xkjy.json.js', function() {



        var dataList = [];
        var zhangjieList = [];

        var jsonTOcsv = function(name, list) {


            var data = {
                list: list,
                kemu: kemu,
                name: name
            };


            $.post('http://127.0.0.1:9000/json2csv?organId=xkjy', data, function(data, text) {
                // console.log('====================  all done !!!!!! ====================================');
                if (text === 'success') {

                    if (kaoshi.length) {
                        console.log(data);
                        kaoQueue(kaoshi);
                        // zhangjieQueue(zhangjie);
                    } else {
                        console.log(data);
                        console.log('====================  all done !!!!!! ====================================');
                    }
                } else {
                    console.log('===========================  失败  ==================================');
                }
            });



        };

        var zhangjieFn = function(name) {
            zhangjieList = zhangjieList.concat(dataList);
            if (zhangjie.length) {
                zhangjieQueue(zhangjie);
            } else {
                jsonTOcsv(name, zhangjieList);
            }
        };


        var runQueue = function(ids, name) {
            //console.log(queue);
            //  判断是否有任务在跑


            var currentId = ids.shift();
            if (!currentId) {

                zhangjieFn(name);
            }

            var url = 'http://xunkaotiku.com/tmpdata/subject/' + currentId + '.o';

            $.post(url, function(data, textStatus, xhr) {
                dataList.push(JSON.parse(data));
                if (ids.length) {
                    runQueue(ids, name);
                } else {
                    jsonTOcsv(name, dataList);

                    // zhangjieFn(name);
                }
            });
        };



        var zhangjieQueue = function(ary) {
            dataList = [];
            var item = ary.shift();

            var pid = item.id;

            var fileName = item.bankTypeName + '-' + item.code + '-' + item.name;

            console.log(item);

            //http://xunkaotiku.com/chaptersubject.shtm?method=startExChapter&type=1&t=1461139565728&chapterId=bc3e65da4a74ff49014a7503a1ff0002
            $.post('http://xunkaotiku.com/chaptersubject.shtm?method=startExChapter&type=1&t=1461139565728&chapterId=' + pid)

            .done(function(data) {

                var html = $(data).find('#chapterSubjects');

                var ids = [];
                $('input[name=id]', html).each(function() {
                    var ele = $(this);
                    ids.push(ele.val());
                });
                console.log(ids);
                runQueue(ids, fileName);
            });
        };

        // zhangjieQueue(zhangjie);


        var kaoQueue = function(ary) {

            dataList = [];
            var item = ary.shift();

            var pid = item.id;
            var submitId = '';
            if (!item) return;


            // /custBankTimes.shtm?method=start&bankId="+id+"&t=1461072443736

            $.post('http://xunkaotiku.com/custBankTimes.shtm?method=start&bankId=' + pid + '&t=' + Math.random())

            .then(function(data) {


                return $.post("/custBankTimes.shtm?method=start2&bankId=" + pid + "&tpVal=" + item.tpVal + "&t=" + Math.random());
            })

            .then(function(data) {

                return $.post('/custBankTimes.shtm?method=saveExCustTimes&bankId=' + pid);
            })

            .then(function(data) {

                return $.post('http://xunkaotiku.com/custBankTimes.shtm?method=startExBankTimes&typeId=&timesId=' + pid);
            })

            .then(function(data) {
                var reg = /[\s\S]*<input type="hidden" name="timesId" value="([\w\d]*)">[\s\S]*/img;
                var regVal = reg.exec(data);
                submitId = regVal[1];
                if (!regVal) {
                    console.log(data);
                } else {
                    console.log(submitId);
                }

                return $.post('http://xunkaotiku.com/custBankTimes.shtm?method=updateExCustTimes&timesId=' + submitId);
            })

            .then(function(data) {

                return $.post('http://xunkaotiku.com/custBankTimes.shtm?method=startBankTimes');
            })


            .then(function(data) {


                var html = $(data).find('#con_one_4');

                var url = html.find('.right2_z3_2').eq(0).find('a').eq(0).attr('href');

                return $.post(url);
            })

            .done(function(data) {

                var html = $(data).find('#chapterSubjects');

                var ids = [];
                $('input[name=id]', html).each(function() {
                    var ele = $(this);
                    ids.push(ele.val());
                });

                runQueue(ids, item.name);
            });



        };

        kaoQueue(kaoshi);
    });
});
