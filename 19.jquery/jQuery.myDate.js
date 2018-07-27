(function ($) {
    var myDate = function (element, options) {
        this.element = $(element);
        this.startTime = options.startTime || MyDateGlobel.startTime;
        this.endTime = options.endTime || MyDateGlobel.endTime;
        //  连字符
        this.hyphen = options.hyphen || "-";
        //  格式
        this.format = (options.format ? options.format : "yyyy-mm-dd").split("-");
        this.picker = $(MyDateGlobel.renderTemplate());
        this.resultTime = "";
        this.resultYear = MyDateGlobel.decade(MyDateGlobel.todayYear).toString();
        this.resultMonth = MyDateGlobel.decade(MyDateGlobel.todayMonth);
        this.resultDay = MyDateGlobel.decade(MyDateGlobel.todayDay);
        this.init();
    };
    myDate.prototype = {
        constructor: myDate,
        init: function () {
            this.picker.appendTo("body").on({
                click: $.proxy(this.pickerClick, this), mousedown: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }).data("number", MyDateGlobel.number++);
            this.picker.find("th").data("datepicker", {type: "handle"});
            this.picker.find(".years").data("datepicker", {type: "years"});
            this.picker.find(".months").data("datepicker", {type: "months"});
            var tr = this.picker.find(".days").data("datepicker", {type: "days"}).parents("table").find("tr");
            tr.find("td:last").add(tr.find("td:first")).addClass("day-off");
            this.element.on({
                focus: $.proxy(this.inputFocus, this),
                blur: $.proxy(this.inputBlur, this),
            });
        },
        inputFocus: function (e) {
            this.pickerShow();
        },
        inputBlur: function (e) {
            this.pickerHide();
        },
        pickerShow: function () {
            var $element = this.element;
            var _left = $element.offset().left;
            var _top = $element.offset().top + $element.height() + 8;
            this.picker.css({top: _top, left: _left});
            this.picker.show().find("table").hide().siblings(".days-table").show();
        },
        pickerHide: function () {
            this.picker.hide();
        },
        pickerClick: function (e) {
            var $target = $(e.target);
            if ($target[0].tagName === "TABLE") {
                return false;
            }
            var type = $target.data("datepicker") && $target.data("datepicker").type;
            var $table = $target.parents("table");
            if ($target[0].tagName === "TD") {
                $target.parents("table").find("td").removeClass("active").end().end().addClass("active");
                var resultYear = $target.hasClass("years") ? $target.html() : this.resultYear;
                var resultMonth = $target.hasClass("months") ? $target.html() : this.resultMonth;
                var resultDay = $target.hasClass("days") ? $target.html() : this.resultDay;
                this.getResultTime(resultYear, resultMonth, resultDay);
                if ($target.hasClass("darkGrey")) {
                    if ($target.parent().index() > 1) {
                        //  向右
                        $table.find(".next").trigger("click");
                    } else {
                        $table.find(".prev").trigger("click");
                    }
                } else {
                    if ($table.next().length) {
                        $table = $table.hide().next().show();
                        $table.find(".switch").html(this.resultYear);
                        if ($table.hasClass("days-table")) {
                            this.daysPickerChange($table);
                        }
                    }
                }

            } else if (type === "handle") {
                //  功能按钮    按钮的类, table类型
                var _class = $target.prop("className");
                switch (_class) {
                    case "prev":
                        this.prevClick($table);
                        break;
                    case "switch":
                        this.switchClick($table);
                        break;
                    case "next":
                        this.nextClick($table);
                        break;
                }
            }
        },
        prevClick: function ($table, isRight) {
            if ($table.hasClass("years-table")) {
                this.resultYear -= 10;
                if (isRight) {
                    this.resultYear += 20;
                }
                var temp = MyDateGlobel.initYearTemplate(Number(this.resultYear), 'years');
                $table.find("tbody").html(temp);
                $table.find(".years").data("datepicker", {type: "years"});
                this.resultYear = $table.find(".active").html();
            } else if ($table.hasClass("months-table")) {
                this.resultYear--;
                if (isRight) {
                    this.resultYear += 2;
                }
            } else if ($table.hasClass("days-table")) {
                this.resultMonth--;
                if (isRight) {
                    this.resultMonth += 2;
                }
                if (this.resultMonth >= 13) {
                    this.resultMonth = 1;
                    this.resultYear = (Number(this.resultYear) + 1).toString();
                } else if (this.resultMonth <= 0) {
                    this.resultMonth = 12;
                    this.resultYear--;
                }
                this.daysPickerChange($table);
            }
            this.resultYear = this.resultYear.toString();
            //  年份修改
            $table.find(".switch").html(this.resultYear);
            //  input值修改
            this.getResultTime(this.resultYear, this.resultMonth, this.resultDay);
        },
        daysPickerChange: function ($table) {
            var todayMonthFirstWeek = MyDateGlobel.getMonthFirstWeek(this.resultYear, this.resultMonth);
            var lastMonthLastDay = MyDateGlobel.getMonthLastDay(this.resultYear, this.resultMonth - 1);
            var thisMonthLastDay = MyDateGlobel.getMonthLastDay(this.resultYear, this.resultMonth);
            this.resultDay = Math.min(thisMonthLastDay, this.resultDay).toString();
            //  日期翻页
            var _htmlStr = MyDateGlobel.initDayTemplate(Number(this.resultDay), todayMonthFirstWeek, lastMonthLastDay, thisMonthLastDay);
            $table.find("tbody").html(_htmlStr);
            //  绑定休息日
            var tr = this.picker.find(".days").data("datepicker", {type: "days"}).parents("table").find("tr");
            tr.find("td:last").add(tr.find("td:first")).addClass("day-off");
        },
        switchClick: function (table) {
            if (table.prev().length) {
                var $table = table.hide().prev().show();
                $table.find(".active").removeClass("active");
                $table.find(".switch").html(this.resultYear);
                if ($table.hasClass("months-table")) {
                    $table.find("td").eq(this.resultMonth - 1).addClass("active");
                } else if ($table.hasClass("years-table")) {
                    var _str = MyDateGlobel.initYearTemplate(Number(this.resultYear), 'years');
                    $table.find("tbody").html(_str);
                }
            }
        },
        nextClick: function ($table) {
            this.prevClick($table, true);
        },
        getResultTime: function (resultYear, resultMonth, resultDay) {
            var arr = [];
            for (var i = 0; i < this.format.length; i++) {
                var _item = this.format[i];
                switch (_item[0]) {
                    case "y":
                        this.resultYear = resultYear;
                        resultYear = _temp(resultYear, _item.length);
                        arr.push(resultYear);
                        break;
                    case "m":
                        this.resultMonth = resultMonth;
                        resultMonth = _temp(resultMonth, _item.length, 'm');
                        arr.push(resultMonth);
                        break;
                    case "d":
                        this.resultDay = resultDay;
                        resultDay = _temp(resultDay, _item.length, 'd');
                        arr.push(resultDay);
                        break;
                }
            }
            function _temp(res, _len, type) {
                if (type) {
                    if (Number(res) >= 10) {
                        return res;
                    }
                }
                return res.length >= _len ? res.slice(-_len) : MyDateGlobel.decade(res);
            }

            this.resultTime = arr.join(this.hyphen);
            this.element.val(this.resultTime);
        }
    };
    var MyDateGlobel = {
        startTime: new Date(0),
        endTime: new Date(2100, 1, 1),
        today: new Date(),
        number: 0,
        dateMap: {
            month: [
                ["一月", "01", "January", "Jan"],
                ["二月", "02", "February", "Feb"],
                ["三月", "03", "March", "Mar"],
                ["四月", "04", "April", "Apr"],
                ["五月", "05", "May", "May"],
                ["六月", "06", "June", "Jun"],
                ["七月", "07", "July", "Jul"],
                ["八月", "08", "August", "Aug"],
                ["九月", "09", "September", "Sep"],
                ["十月", "10", "October", "Oct"],
                ["十一月", "11", "November", "Nov"],
                ["十二月", "12", "December", "Dec"],
            ],
            week: [
                ["星期天", "日", "Sunday", "Sun"],
                ["星期一", "一", "Monday", "Mon"],
                ["星期二", "二", "Tuesday", "Tues"],
                ["星期三", "三", "Wednesday", "Wed"],
                ["星期四", "四", "Thurday", "Thur"],
                ["星期五", "五", "Friday", "Fri"],
                ["星期六", "六", "Saturday", "Sat"],
            ]
        },
        initToday: function () {
            this.todayYear = this.today.getFullYear();
            this.todayMonth = this.today.getMonth() + 1;
            this.todayDay = this.today.getDate();
            this.todayMonthFirstWeek = this.getMonthFirstWeek(this.todayYear, this.todayMonth);
            this.lastMonthLastDay = this.getMonthLastDay(this.todayYear, this.todayMonth - 1);
            this.thisMonthLastDay = this.getMonthLastDay(this.todayYear, this.todayMonth);
        },
        //  获得本月第一天的星期
        getMonthFirstWeek: function (year, month) {
            console.log(new Date(year, month - 1).getDay());
            return new Date(year, month - 1).getDay();
        },
        //  每个月的最后一天
        getMonthLastDay: function (year, month) {
            if (month === 0) {
                month = 12;
            }
            return [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
        },
        //  是否闰年
        isLeapYear: function (year) {
            return (!(year % 100)) ? (!(year % 400)) : (!(year % 4));
        },
        initTemplate: function () {
            this.headTemplate = '<thead><tr><th class="prev">&lsaquo;</th><th class="switch" colspan="5">' + this.todayYear + '</th><th class="next">&rsaquo;</th></tr></thead>';
            this.headYearTemplate = '<thead><tr><th class="prev">&lsaquo;</th><th class="switch" colspan="2">' + this.todayYear + '</th><th class="next">&rsaquo;</th></tr></thead>';
            this.contYearTemplate = this.initYearTemplate(this.todayYear, 'years');
            this.contMonthTemplate = this.initYearTemplate(this.todayMonth, 'months');
            this.contDayTemplate = this.initDayTemplate(this.todayDay, this.todayMonthFirstWeek, this.lastMonthLastDay, this.thisMonthLastDay);
        },
        initYearTemplate: function (todayVal, className) {
            var initVal = 1;
            if (className === "years") {
                initVal = parseInt(todayVal / 10) * 10 - 1;
            }
            var _conStr = '';
            for (var i = 0; i < 3; i++) {
                var _str = "<tr>";
                for (var j = 0; j < 4; j++) {
                    var _item = this.dateMap.month[initVal - 1];
                    _item = (_item && _item[1]) || this.decade(initVal);
                    var _className = className + (initVal === Number(todayVal) ? ' active' : '');
                    if (i === 0 && j === 0 || i === 2 && j === 3) {
                        if (className === "years") {
                            _className += " darkGrey";
                        }
                    }
                    _str += '<td class="' + _className + '">' + _item + '</td>';
                    initVal++;
                }
                _str += "</tr>";
                _conStr += _str;
            }
            return _conStr;
        },
        initDayTemplate: function (todayVal, todayMonthFirstWeek, lastMonthLastDay, thisMonthLastDay) {
            var _conStr = "<tr>";
            for (var key in this.dateMap.week) {
                _conStr += '<td class="week">' + this.dateMap.week[key][1] + '</td>'
            }
            _conStr += "</tr>";
            var currentDay = 1;
            var c = 0;
            var _isLastRow = false;
            var _isGrey = false;
            var _isActive = false;
            for (var i = 0; i < 6; i++) {
                var _str = "<tr>";
                for (var j = 0; j < 7; j++) {
                    if (i === 0) {
                        if (j < todayMonthFirstWeek) {
                            c = lastMonthLastDay - (todayMonthFirstWeek - 1 - j);
                            _isGrey = true;
                            _isActive = false;
                        } else {
                            _isActive = (currentDay === todayVal);
                            c = currentDay++;
                            _isGrey = false;
                        }
                    } else {
                        _isActive = (currentDay === todayVal);
                        if (j === 0) {
                            _isLastRow = true;
                        }
                        if (currentDay > thisMonthLastDay) {
                            _isGrey = true;
                            _isActive = false;
                            if (j === 0) {
                                _str = "";
                                break;
                            }
                            c = 1;
                            currentDay = 1;
                            currentDay++;
                            i = 10;
                        } else {
                            c = currentDay++;
                        }
                    }
                    _str += '<td class="days' + (_isActive ? ' active' : "") + (_isGrey ? ' darkGrey' : "") + '">' + this.decade(c) + '</td>';
                }
                if (!_isLastRow) {
                    _str += "</tr>";
                }
                _conStr += _str;
            }
            return _conStr;
        },
        renderTemplate: function () {
            return '<div class="my-date-wrap"><table class="my-date-table years-table">' + MyDateGlobel.headYearTemplate + '<tbody>' + this.contYearTemplate + '</tbody></table>'
                + '<table class="my-date-table months-table">' + MyDateGlobel.headYearTemplate + '<tbody>' + this.contMonthTemplate + '</tbody></table>'
                + '<table class="my-date-table days-table">' + MyDateGlobel.headTemplate + '<tbody>' + this.contDayTemplate + '</tbody></table></div>';
        },
        decade: function (n) {
            if (isNaN(n)) {
                return n;
            }
            return n.toString().length >= 2 ? n : "0" + n;
        }
    };
    MyDateGlobel.initToday();
    MyDateGlobel.initTemplate();
    MyDateGlobel.template = MyDateGlobel.renderTemplate();
    $.fn.myDate = function (options) {
        return this.each(function () {
            options = options || {};
            var $this = $(this);
            if (!$this.data("myDate")) {
                $this.data("myDate", new myDate(this, options));
            } else {
                return false;
            }
        })
    };
})(jQuery);