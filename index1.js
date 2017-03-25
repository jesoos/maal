// index1.js

$(function() {
  "use strict";

  function info(s) {
    $("#user").hide();
    $("#msg").html(s).draggable({ cursor:"move" }).show();
  }

  // 서버 에러 메시지를 출력한다 (서버 프로그램 이름, 메시지)
  function serverError(serverProgramName, message) {
    info("서버(" + serverProgramName + ") 에러: " + message);
  }

  // 입력 에러를 표시하고 에러 메시지를 출력한다 (객체, 메시지)
  function setError(o, message) {
    o.addClass("ui-state-error");
    o.attr("title", message);
  }

  // 에러 표시와 에러 메시지를 제거한다 (객체)
  function resetError(o) {
    o.removeClass("ui-state-error");
    o.removeAttr("title");
  }

  // 메시지를 보여주거나 지운다 (객체, 정상인가?, 에러 메시지)
  function check(o, isOk, message) {
    if (isOk) {
      resetError(o);
    } else {
      setError(o, message);
    }
    return isOk;  // 정상일 때 true를 넘긴다
  }

  function checkPasses(isFinal) {
    resetError($("#pass"));
    resetError($("#pass1"));
    var o1 = $("#pass"),  p1 = o1.val();
    var o2 = $("#pass1"), p2 = o2.val();
    if (isFinal || p1.length && p2.length) {
      var o = p1.length <= p2.length? o1: o2;  // 짧은 쪽에 에러 표시
      if (o.val().length < 4) return check(o, false, "네 자리보다 짧습니다.");
      return check(o, p1 === p2, "두 비밀번호가 다릅니다.");
    }
    return true;
  }

  $("#pass,#pass1").change(function() {
    checkPasses();
  });

  $("#ok").click(function() {
    if (checkPasses(true)) {
      if ($("#id").val()) {
        $.post("updatePass.php", $("#id,#pass"), function(rc) {
          if (rc == '1') {
            info("비밀번호가 바뀌었습니다.");
          } else {
            serverError("updatePass.php", rc);
          }
        });
      } else {
        $.post("addUser.php", $("#nick,#pass,#name,#mail,#sure"), function(rc) {
          if (rc == '2') {
            info($("#sure").val() +" 님이 보증하거나 거절하면 전자우편으로 알려드리겠습니다.");
          } else if ($.isNumeric(rc)) {
            if ((rc & 4) === 0) info($("#nick").val() +" 님은 이미 가입하셨습니다.");
            if ((rc & 8) === 0) info($("#sure").val() +" 님은 보증인이 될 수 없습니다.");
          } else {
            serverError("addUser.php", rc);
          }
        });
      }
    }
  });

  $("#user").keyup(function(e) {
    if (e.keyCode == $.ui.keyCode.ENTER) {
      $(this).find("#ok").click();
      return false;
    }
  });

  $("#tabs").tabs();
  $("body").tooltip({ show:false, hide:false });

  function msie(f) {
    var a = navigator.userAgent;
    var i = a.indexOf('MSIE ');
    if (0 < i && (i = parseInt(a.substring(i + 5))) < 11) f(i);
  }

  msie(function(i) {
    info("인터넷익스플로러 "+ i +"에서는 안되는 기능이 더러 있습니다.<br>"+
         "다른 브라우저를 써 보세요: "+
    "<a href='https://www.google.com/chrome/' target='_blank'>크롬</a>, "+
    "<a href='http://www.opera.com/ko' target='_blank'>오페라</a>, "+
    "<a href='https://www.mozilla.org/firefox/new/' target='_blank'>파이어폭스</a>.");
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
          if (this[i] === obj) return i;
        }
        return -1;
      };
    }
    if (!String.prototype.trim) {
      String.prototype.trim = function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
      };
    }
  });
});
