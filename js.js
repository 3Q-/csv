        var perTime = null;
        var selectId = null;
        var selectSubjectId = null;
        var selectType = null;
        var fontSize = 14;
        var contentHeight = 376;
        var height = 594;
        var select_kemu = null;
        var timer = null;
        var lesTime = 3600;
        var now = (new Date()).getTime();
        $(function() {
            $(document.getElementById("examTopicWrapId")).find("li:first").trigger("click");
            timer = setInterval("changeTime()", 1000);
        });

        function changeTime() {
            var s = (new Date()).getTime();
            lesTime = parseInt(lesTime) - parseInt(Math.round(parseInt(s - now) / 100) / 10);
            now = s;
            if (lesTime > 0) {
                var fz = parseInt(lesTime / 60);
                var mz = parseInt(lesTime % 60);
                $(document.getElementById("examtime")).text(fz + "分" + mz + "秒");
            } else {
                clearTimeout(timer);
                submit_click();
            }
        }

        function toSubject(id, type, sid, stype) {
            if (!online_validate()) {
                alert($.cookie('REONLINE_MESSAGE'));
                window.close();
                return;
            }
            if (null != selectId) {
                $(document.getElementById("content_div" + selectId)).css("display", "none");
                $(document.getElementById("result_div" + selectId)).css("display", "none");
                $(document.getElementById("li" + selectId)).removeClass("border_bg");
            }
            if (selectType == '4') {
                tiand_validate();
            }
            selectId = id;
            selectType = type;
            selectSubjectId = sid, $(document.getElementById("content_div" + selectId)).css("display", "");
            $(document.getElementById("result_div" + selectId)).css("display", "");
            $(document.getElementById("li" + selectId)).addClass("border_bg");
            if ($(document.getElementById("li" + selectId)).hasClass("red_bg")) {
                $(document.getElementById("standingby")).removeClass("Undetermined");
                $(document.getElementById("standingby")).addClass("Undetermined-gray");
            } else {
                $(document.getElementById("standingby")).addClass("Undetermined");
                $(document.getElementById("standingby")).removeClass("Undetermined-gray");
            }
            if (selectType == '4') {
                $(document.getElementById("button_jiexi")).css("display", "");
                $(document.getElementById("examTopicShow")).css("height", 94);
                $(document.getElementById("examAnswerShow")).css("height", 600).css("width", 1000);
                $(document.getElementById("iframe" + selectId)).attr("src", "/jsp/exam/tiand/index.jsp?timesId=8f565487ef3a4406854f7fa50d61f721&type=" + stype + "&subjectId=" + selectSubjectId);
            } else {
                $(document.getElementById("button_jiexi")).css("display", "none");
                $(document.getElementById("examTopicShow")).css("height", contentHeight);
                $(document.getElementById("examAnswerShow")).css("height", height - contentHeight).css("width", "");
            }
        }

        function showResult(id) {
            var is = $("input[name='result" + id + "'][checked='checked'],input[name='result" + id + "']:checked");
            var s = "";
            if (is.length > 0) {
                for (var i = 0; i < is.length; i++) {
                    s += $(is[i]).val();
                }
            }
            if ("" != s) {
                $(document.getElementById("result_span_" + id)).html(s);
                $(document.getElementById("li" + id)).addClass("green_bg ");
            } else {
                $(document.getElementById("result_span_" + id)).html("");
                $(document.getElementById("li" + id)).removeClass("green_bg ");
            }
        }

        function showResultFenxi(id, type) {
            var s = "";
            if (type == "1" || type == "2" || type == "3") {
                var is = $("input[name='result" + id + "'][checked='checked'],input[name='result" + id + "']:checked");
                if (is.length > 0) {
                    for (var i = 0; i < is.length; i++) {
                        s += $(is[i]).val();
                    }
                }
                $(document.getElementById("result_span_" + id)).html(s);
            } else if (type == "8") {
                var jdfxs = document.getElementsByName("jdfx" + id);
                var kemus = document.getElementsByName("kemu" + id);
                var kemuNames = document.getElementsByName("kemuName" + id);
                var jines = document.getElementsByName("jine" + id);
                var s = "";
                var sr = "";
                if (null != jdfxs) {
                    for (var i = 0; i < jdfxs.length; i++) {
                        s += jdfxs[i].value + "|" + kemus[i].value + "|" + jines[i].value + ";";
                        sr += jdfxs[i].value + "," + kemus[i].value + " " + kemuNames[i].value + "," + jines[i].value + ";";
                    }
                }
                $(document.getElementById("result_span_" + id)).html(sr);
                $(document.getElementById("li" + selectId)).addClass("green_bg ");
            } else if (type == "9") {
                s = $("input[name='jine" + id + "']:eq(0)").val();
                $(document.getElementById("result_span_" + id)).html(s);
            }
            if ("" != s) {
                $(document.getElementById("li" + selectId)).addClass("green_bg ");
            } else {
                $(document.getElementById("result_span_" + id)).html("");
            }
        }

        function kjkmxq_open(t) {
            select_kemu = t;
            $("#kemu_select_div").css("display", "");
            $("#ldg_lockmask").css("display", "");
        }

        function first_click() {
            $(document.getElementById("examTopicWrapId")).find("li:first").trigger("click");
        }

        function per_click() {
            var num = $(document.getElementById("examTopicWrapId")).find("li").index($(document.getElementById("li" + selectId)));
            if (num > 0) {
                $(document.getElementById("examTopicWrapId")).find("li:eq(" + (parseInt(num) - 1) + ")").trigger("click");
            }
        }

        function next_click() {
            var num = $(document.getElementById("examTopicWrapId")).find("li").index($(document.getElementById("li" + selectId)));
            $(document.getElementById("examTopicWrapId")).find("li:eq(" + (parseInt(num) + 1) + ")").trigger("click");
        }

        function last_click() {
            $(document.getElementById("examTopicWrapId")).find("li:last").trigger("click");
        }

        function pause_click() {
            if ($(document.getElementById("li" + selectId)).hasClass("red_bg")) {
                $(document.getElementById("li" + selectId)).removeClass("red_bg");
                $(document.getElementById("standingby")).addClass("Undetermined");
                $(document.getElementById("standingby")).removeClass("Undetermined-gray");
            } else {
                $(document.getElementById("li" + selectId)).addClass("red_bg");
                $(document.getElementById("standingby")).removeClass("Undetermined");
                $(document.getElementById("standingby")).addClass("Undetermined-gray");
            }
        }

        function font_add_click() {
            if (fontSize <= 20) {
                fontSize = parseInt(fontSize) + 2;
                $(".content").css("font-size", fontSize);
            }
        }

        function font_less_click() {
            if (fontSize >= 10) {
                fontSize = parseInt(fontSize) - 2;
                $(".content").css("font-size", fontSize);
            }
        }

        function height_add_click() {
            if (contentHeight > 150) {
                contentHeight = contentHeight - 20;
                $(document.getElementById("examTopicShow")).css("height", contentHeight);
                $(document.getElementById("examAnswerShow")).css("height", height - contentHeight);
            }
        }

        function height_less_click() {
            if (contentHeight < 474) {
                contentHeight = contentHeight + 20;
                $(document.getElementById("examTopicShow")).css("height", contentHeight);
                $(document.getElementById("examAnswerShow")).css("height", height - contentHeight);
            }
        }

        function changeColor(c) {
            $("#examTopicShow").css("background-color", c);
            $("#examAnswerShow").css("background-color", c);
        }

        function submit_click() {
            if (selectType == '4') {
                tiand_validate();
            }
            document.times_form.submit();
        }

        function tiand_validate() {
            $.ajax({
                type: "POST",
                url: "/tiand.shtm?method=validateTiandSubject&timesId=8f565487ef3a4406854f7fa50d61f721&id=" + selectSubjectId,
                async: false,
                dataType: "text",
                complete: function(msg) {
                    $(document.getElementById("result" + selectId)).val(msg.responseText);
                    $(document.getElementById("result_span_" + selectId)).text("已答");
                    $(document.getElementById("li" + selectId)).addClass("green_bg ");
                }
            });
        }

        function addFenlu(id) {
            var ht = $(document.getElementById("fenlu" + id)).find("p:first").html();
            var fl = $("<p>" + ht + "<a   onclick=\"removeFenlu(this)\" class=\"anaddrecd removeRecd\"> - </a></p>");
            $(document.getElementById("fenlu" + id)).append(fl);
        }

        function removeFenlu(obj) {
            $(obj).parent().remove();
        }

        function subject_div_close() {
            $("#ldg_subject_div").css("display", "none");
            $("#ldg_lockmask").css("display", "none");
        }

        function subject_div_open() {
            $("#ldg_subject_div").css("display", "");
            $("#ldg_lockmask").css("display", "");
        }

        function subject_menu_hide(o, sbid) {
            if ($(document.getElementById(sbid)).css("display") == "block") {
                $(document.getElementById(sbid)).css("display", "none");
                $(o).addClass("showorhidelist");
            } else {
                $(document.getElementById(sbid)).css("display", "block");
                $(o).removeClass("showorhidelist");
            }
        }

        function showFenxi() {
            window.showModalDialog("/subject.shtm?method=showFlashFile&id=" + selectSubjectId, window, "center=yes;help=no;resizable=no;status:no;scroll=no;dialogWidth:1050px;dialogHeight:580px;");
        }
