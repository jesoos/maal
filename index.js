// index.js

$(function() {
  "use strict";

  var ask_uid, uid, nick, name, mail, sure; // 사용자: 번호,아이디,이름,이메일,보증인
  var word, expl = [];        // 낱말, [0]=풀이 [1]=적바림
  var word0, data1;           // 지운 낱말, 편집 후 데이터
  var eEdit = {};
  var words = localStorage && localStorage.words && JSON?
                      JSON.parse(localStorage.words): [];
  var arg_words = [], arg_i = -1;
  var downloadable = ("download" in document.createElement("a"));

  function info(s) {
    $("#msg").html(s).draggable({ cursor:"move" }).show()
             .click(function() { $(this).hide(); });
  }

  // 서버 에러 메시지를 출력한다 (서버 프로그램 이름, 메시지)
  function serverError(serverProgramName, message) {
    $("#tip").html("서버(" + serverProgramName + ") 에러: " + message).show();
  }

  // 입력 에러를 표시하고 에러 메시지를 출력한다 (객체, 메시지[, 출력 객체])
  function setError(o, message, oMessage) {
    o.addClass("ui-state-error");
    if (oMessage) {
      oMessage.html(message).show();
    } else {
      o.attr("title", message);
    }
  }

  // 에러 표시와 에러 메시지를 제거한다 (객체[, 출력 객체])
  function resetError(o, oMessage) {
    o.removeClass("ui-state-error");
    if (oMessage) {
      oMessage.hide();
    } else {
      o.removeAttr("title");
    }
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

  // 보이는 것의 메시지를 보여주거나 지운다 (객체, 정상인가?, 에러 메시지)
  function checkWhileVisible(o, isOk, message) {
    return o.is(":visible")? check(o, isOk, message): true;
  }

  function checkEmpty(field, display) {
    var o = $(field);
    return checkWhileVisible(o, o.val(), display +" 넣으시오.");
  }

  function checkName() { return checkEmpty("#name", "이름을"); }
  function checkSure() { return checkEmpty("#sure", "보증인 아이디를"); }

  function checkMail(s) {
    var o = $(s);
    return checkWhileVisible(o,
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(o.val()),
      "전자우편 주소 형식이 맞지 않습니다.");
  }

  function checkPhone() {
    var o = $("#phone");
    return checkWhileVisible(o, /^\d+(-\d+)*$/.test(o.val()),
                         "전화번호 형식이 맞지 않습니다.");
  }

  $("#name").change(function() { checkName(); });

  $("#mail").change(function() {
     if (checkMail("#mail") && $("#mail") != mail) {
       $.post("checkMail.php", $(this), function(rc) {
         if (rc == '1') {
           if ($("#enter").is(":visible")) {
             $("#nick").val($("#mail").val()).change();
           } else {
             setError($("#mail"), "이미 가입한 전자우편 주소입니다.");
           }
         }
       });
     }
  });

  $("body").keydown(function(e) {
    if (e.keyCode === $.ui.keyCode.ESCAPE) {
      $(".ui-autocomplete-input").autocomplete("close");
    }
  });

  $("#user,#q-req,#ask,#toSure,#list").keyup(function(e) {
    switch (e.keyCode) {
      case $.ui.keyCode.ESCAPE: $(this).find(".x-close").click(); return false;
      case $.ui.keyCode.ENTER:  $(this).find(".b-shade").click(); return false;
    }
  });

  $("#nick,#name,#mail,#sure").keydown(function(e) {
    if (e.keyCode === $.ui.keyCode.SPACE) return false;
  });

  $("#nick").val('');

  $("#nick").change(function() {
    var n = $(this).val();
    if ($("#enter").is(":visible")) {
      resetError($("#pass,#name,#mail,#sure").val("")); // 그것 빼고 모두 지운다
      $("#tip").hide();
      uid = "";
      $.post("getUser.php", $(this), function(user) {
        uid  = user.id;
        nick = $("#nick").val();
        $("#name").val(name = user.name);
        $("#mail").val(mail = user.mail);
        $("#sure").val(sure = user.sure);
        if (uid == '0' || uid && 0 < user.rank) {
          if (uid == '0') uid = '';
          showIf($("#passx"), uid);
          $("#name_mail_sure,#quit").hide();
          $("#signin").show();            // 비밀번호 입력 줄
          $("#nick").val(nick = user.nick);
          $(nick? "#pass": "#nick").focus();
          $("#nick").prop("defaultValue", nick);
        } else {
          $("#nick").prop("defaultValue", '');
          syncSureToNick(nick);
          $("#signin").hide();            // 비밀번호 입력 줄
          $("#name_mail_sure").show();    // 사용자 등록 양식
          $("#name").focus();             // 이름 입력 줄로 이동한다
          showQuit();
        }
      }, "json").fail(function(xhr) {
        serverError("getUser.php", xhr.responseText);
      });
    } else if (n === nick) {
      resetError($(this));
      syncSureToNick(n);
    } else {
      $.post("getNickId.php", $(this), function(rc) {
        if (rc == '0') {
          syncSureToNick(n);
        } else if ($.isNumeric(rc)) {
          setError($("#nick"), "사용 중인 아이디입니다.");
        } else {
          serverError("getNickId.php", rc);
        }
      });
    }
  }).blur(function() { if (!$(this).val()) $(this).focus(); });

  $("#sure").change(function() {
    var n = $("#nick").val();
    var s = $("#sure").val();
    if (s && s === nick) $("#sure").val(s = n);
    if (s === n) {
      check($("#sure"), $("#exit").is(":visible"), "다른 아이디를 넣으시오.");
    } else {
      $.post("getSureId.php", $("#sure"), function(rc) {
        if ($.isNumeric(rc)) {
          check($("#sure"), 0 < rc, "다른 아이디를 넣으시오.");
        } else {
          serverError("getSureId.php", rc);
        }
      });      
    }
  });

  function syncSureToNick(newNick) {
    var oldNick = $("#nick").prop("defaultValue");
    if (oldNick && oldNick === $("#sure").val()) {
      $("#sure").val(newNick);
    }
    $("#nick").prop("defaultValue", newNick);
  }

  function checkPass() {
    if (uid) {
      var o = $("#pass"), pass = o.val().trim();
      o.val(pass);
      showIf($("#x-ask"), !pass);
      if (pass) {
        $.post("checkPass.php", o.serialize() +"&id="+ uid, function(rc) {
          switch (rc) {
          case '0': enter(); break;                           // 맞음
          case '1': $("#nick").change(); break;               // 없음
          case '2': setError(o, "비밀번호가 맞지 않습니다."); break;  // 틀림
          default:  serverError("checkPass.php", rc);         // 에러
          }
        });
      } else {
        setError(o, "비밀번호를 넣으시오.");
      }
    }
  }

  $("#passx").click(function() {
    var arg = $("#nick,#mail").serialize() +"&id=-"+ uid;
    $(this).hide();
    $.post("confirmMail.php", arg, function(rc) {
      updateMsg(rc, "confirmMail.php");
    });
  });

  // [확인] 버튼 처리
  $("#ok").click(function() {
    if ($("#signin").is(":visible")) {  // 로그인
      checkPass();
    } else if (checkName() && checkMail("#mail") && checkSure()) {
      var ok = $(this);
      if (uid) {
        var arg = serialize("#mail", mail);
        if (arg) {
          arg = $("#nick").serialize() +"&id="+ uid + arg;
          ok.hide();  // 메일 주소 변경
          $.post("confirmMail.php", arg, function(rc) {
            updateMsg(rc, "confirmMail.php");
            ok.show();
            if (rc == '0') {
              doUpdate();
            }
          });
        } else {
          doUpdate()
        }
      } else {
        ok.hide();  // 새로 가입
        $.post("confirmMail.php", $("#nick,#name,#mail,#sure"), function(rc) {
          updateMsg(rc, "confirmMail.php");
          ok.show();
        });
      }
    }
  });

  function doUpdate() {
    var arg = serialize("#nick", nick) + serialize("#name", name);
    var n = $("#nick").val(), s = $("#sure").val();
    if (n !== s || nick !== sure) {
      arg += serialize("#sure", sure);
    }
    if (arg) {
      $.post("updateUser.php", "id="+ uid + arg, function(rc) {
        updateMsg(rc, "updateUser.php");
      });
    } else {
      doCancel();  // 메일 주소 변경
    }
  }

  function updateMsg(rc, php) {
    if (rc === "c") {
      doCancel();
      info("전자우편을 열고 확인을 누르시오.");
    } else if (rc === "0") {
      info("전자우편을 열고 확인을 누르시오.");
    } else if (rc === "1") {
      if ($("#enter").is(":visible")) {
        $("#nick").change();
      } else {
        saveValues();
        closeDialog();
      }
    } else if (rc === '2') {
      var sure = $("#sure").val();
      $("#exit").click();
      closeDialog();
      info(sure +" 님이 보증하거나 거절하면 전자우편으로 알려드립니다.");
    } else if ($.isNumeric(rc)) {
      check($("#nick"), (rc &  4) === 0, "이미 가입한 아이디입니다.");
      check($("#sure"), (rc &  8) === 0, "다른 아이디를 넣으시오.");
      check($("#mail"), (rc & 16) === 0, "이미 가입한 전자우편 주소입니다.");
    } else {
      serverError(php, rc);
    }
  }

  // [들어가기] 버튼 클릭  -- 로그인, 사용자 등록
  $("#enter").click(function() {
    $("#name_mail_sure,#quit,#x-ask,#passx").hide();
    $("#signin").show();                    // 로그인
    openDialog("들어가기");
  });    // 팝업 창 제목 "들어가기"

  // 사용자 버튼 클릭  -- 사용자 정보 변경
  $("#user_info").click(function() {
    $("#signin,#quit,#x-ask").hide();
    $("#name_mail_sure,#new_pass").show();
    openDialog(name);
    showQuit();
  });

  // [나가기] 버튼 클릭
  $("#exit").click(function() {
    $("#h1").text("배달말집");
    $("#t1,#t2,#t3,#exit_div,#arg,#arg-l,#arg-r").hide();
    $("#enter").show();            // [들어가기] 버튼을 보여준다
    eraseValues();                 // 입력 받은 값을 모두 지운다
  });

  $("#quit").click(function() {
    $.post("deleteUser.php", "id="+ uid +",0,0", function(rc) {
      if (rc == '2') {
        doCancel();
        $("#q-sure").text(sure);
        $("#q-req").show();  
      } else if (rc == '1') {
        $("#exit").click();
        closeDialog();
      } else {
        info("deleteUser.php: "+ rc);
      }
    });
  });

  $("#q-req .b-shade").click(function() {
    $.post("askQuit.php", $("#nick,#sure").serialize() +"&id="+ uid, function(rc) {
      if (!rc) {
        var sure1 = sure;
        $("#exit").click();
        $("#q-req").hide();
        info(sure1 +" 님이 탈퇴를 승낙하거나 거절하면 전자우편으로 알려드립니다.");
      } else {
        info("askQuit.php: "+ rc);
      }
    });
  });

  $("#q-req .x-close").click(function() { $("#q-req").hide(); });
  $(  "#ask .x-close").click(function() { $(  "#ask").hide(); });

  $("#x-ask").click(function() {
    ask_uid = uid;
    doCancel();
    $("#ask").show();
  });

  $("#a-mail").blur(function() { checkMail("#a-mail"); });
  $("#phone" ).blur(function() { checkPhone(); });

  $("#ask .b-shade").click(function() {
    if (checkMail("#a-mail") && checkPhone()) {
      var arg = $("#a-mail,#phone").serialize() +"&id="+ ask_uid;
      $.post("askMail.php", arg, function(rc) {
        if (!rc) {
          $("#exit").click();
          $("#ask").hide();
          info("살펴보고 전자우편으로 알려드리겠습니다.");
        } else {
          info("askMail.php: "+ rc);
        }
      });
    }
  });

  function showQuit() {
    if (uid) {
      $.post("showQuit.php", "id="+ uid, function(rc) {
        if (rc == '0' || rc == '1') {
          showIf($("#quit"), rc == '1');
        } else {
          serverError("showQuit.php", rc);
        }
      });
    } else {
      $("#quit").hide();
    }
  }

  // 입력한 값을 저장한다
  function saveValues() {
    nick = $("#nick").val();       // 아이디
    mail = $("#mail").val();       // 전자우편 주소
    name = $("#name").val();       // 이름
    sure = $("#sure").val();
  }

  // 입력한 값을 모두 지운다
  function eraseValues() {
    $("#user input").val("");
    saveValues();
    uid = 0;
    expl = [];
    $("#arg").val(word = "");
    $("#edit").val(data1 = eEdit.data = "");
    $("#tab1,#tab2,#tab3,#viewer").empty();
    $("#list,#note-form,#ans,#toSure,#word,#editor,#count1,#count2,#count3,#editors").hide();
    $("#t1,#t2,#t3").removeAttr("title");
    $("#t1").click();
  }

  function h1() {
    $("#h1").text($(window).width() > 400? "배달말집":"말집");
  }

  // 정상 로그인 후 입력 받은 값을 저장하고 팝업 창을 닫는다
  function enter() {
    saveValues();                  // 입력 받은 값을 저장한다
    h1();
    $("#enter,#msg").hide();       // [들어가기] 버튼을 숨기고
    $("#exit_div").show();         // [(이름)]과 [나가기] 버튼을 보여준다
    $("#user_info").attr("title", nick);
    $("#arg").show();              // 올림말 입력 창을 보여준다
    arrows();
    closeDialog();        // 팝업 창을 닫는다
    $.post("getCount1.php", function(n) { $("#count1").text(n).show(); });
    $.post("getCount2.php", function(n) { $("#count2").text(n).show(); });
    $.post("getCount3.php", function(n) { $("#count3").text(n).show(); });
    $.post("ans.php", "id="+ uid, function(array) {
      var count = array.length;
      if (0 < count) {
        var o = $("#ans tbody").empty();
        for (var i = 0; i < count; i++) {
          var a = array[i];
          o.append("<tr><td>"+
                   "<input type='radio' name='a"+ a[0] +"'>o "+
                   "<input type='radio' name='a"+ a[0] +"'>x "+
                   "<input type='radio' name='a"+ a[0] +
                        "' checked>?<br><small>"+ a[1] +"</small></td><td>"+
                                    a[2] +"<br>"+ a[3] +"</td><td>"+
                                    a[4] +"<br>"+ a[5] +"</td></tr>");
        }
        $("#ans").show();
      }
    }, 'json').fail(function(xhr) {
      serverError("ans.php", xhr.responseText);
    });
    $.post("toSure.php", "id="+ uid, function(array) {
      var count = array.length;
      if (0 < count) {
        var o = $("#toSure tbody").empty();
        for (var i = 0; i < count; i++) {
          var a = array[i];
          o.append("<tr><td>"+ (a[3] == '0'? "보증": "탈퇴") +": "+
                   "<input type='radio' name='s"+ a[0] +"'>o "+
                   "<input type='radio' name='s"+ a[0] +"'>x "+
                   "<input type='radio' name='s"+ a[0] +"' checked>?</td><td>"+
                               a[1] +"</td><td>"+ a[2] +"</td><td>"+
                   "<img src='glyphicons-11-envelope.png'></td></tr>");
        }
        $("#toSure").show();
      }
    }, 'json').fail(function(xhr) {
      serverError("toSure.php", xhr.responseText);
    });
  }

  // 데이터가 변경되었으면 파라미터로 만든다 (저장된 값, 데이터 선택자)
  function serialize(field, saved) {
    var o = $(field);
    return o.is(":visible") && o.val() != saved? "&"+ o.serialize(): "";
  }

  // 제목 줄에 제목을 넣고 팝업 창을 띄운다 (제목)
  function openDialog(title) {
    $("#title").text(title);
    $("#user").css("top", "0").show();
    $("#nick").focus();
    $("#ok").show();
    $("#nick,#name,#sure").change(function() {
      $(this).val($(this).val().replace(/[ <>'"%&;\\]/g, ""));
    });  // 입력 칸에 특수 글자가 들어가지 않게 막는다
  }

  function closeDialog() {
    $("#user").hide();
    $("#pass").val("");                // 비밀번호를 지운다
    $("#tip").hide();                  // 서버 에러 표시를 제거한다
    resetError($("#user input"));      // 에러 표시를 모두 제거한다
  }

  $("#user .x-close").click(doCancel);

  $("#ans .b-shade").click(function() {
    $("#ans tbody>tr").each(function(i) {
      var o = $(this).find(":checked");
      var index = o.index();
      if (index < 2) {
        var arg = "id="+ index +"_"+ o.attr("name").substring(1);
        $.post("resetUser.php", arg, function(rc) {
          if (rc) info("에러["+ (i + 1) +"] resetUser.php: "+ rc);
        });
      }
    });
    $("#ans").hide();
  });

  $("#toSure .b-shade").click(function() {
    $("#toSure tbody>tr").each(function(i) {
      var o = $(this).find(":checked");
      var index = o.index();
      if (index < 2) {
        var  op = o.parent().text().substring(0,2) == "보증"? 0: 1;
        var php = op + index === 0? "upRank.php": "deleteUser.php";
        var arg = "id="+ o.attr("name").substring(1);
        if (op === 1) arg += ","+ (index === 0? uid: "0");
        $.post(php, arg +"&nick="+ encodeURIComponent(nick), function(rc) {
          if (rc != '1') info("에러["+ (i + 1) +"] "+ rc);
        });
      }
    });
    $("#toSure").hide();
  });

  $("#toSure>tbody").on("click", "img", function() {
    var     tr = $(this).parent().parent();
    var   toId = tr.find(":checked").attr("name");
    var toNick = tr.find("td:eq(1)").text();
    $("#toSure .x-close").hide();
    $("#note-form").width($("#toSure").width()).show()
      .position({ my:"left top", at:"left-1 bottom", of:tr })
      .data([function() { return [[toId, toNick]]; }, "#toSure"]);
    setNoteSize();
    return false;
  });

  // [취소] 버튼 처리
  function doCancel() {
    if ($("#enter").is(":visible")) {      // 사용자 등록/로그인 중이었으면
      eraseValues();                          // 입력한 것을 모두 지운다
    } else {                               // 사용자 정보 수정 중이었으면
      $("#nick").val(nick);                   // 아이디(nick)와
      $("#name").val(name);                   // 이름을 되돌린다
      $("#mail").val(mail);                   // 전자우편 주소와
      $("#sure").val(sure);                   // 전자우편 주소와
    }
    closeDialog();                // 팝업 창을 닫는다
  }

  var JAMO = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ",
              "가","나","다","라","마","바","사","아","자","차","카","타","파","하"];

  function circled(c) {
    var n = c.charCodeAt(0);
    if (0x41 <= n && n <= 0x5a)     return String.fromCharCode(n + 0x2475);
    if (0x61 <= n && n <= 0x7a)     return String.fromCharCode(n + 0x246f);
    if (0 <= (n = JAMO.indexOf(c))) return String.fromCharCode(n + 0x3260);
    return "";
  }

  function circledNumber(n) {
    n += n < 1? 0x24ea: n < 21? 0x245f: n < 36? 0x323c: 0x328d;
    return String.fromCharCode(n);
  }

  var RE1 = /[\u3011:\u3015\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]/g;
  var RE2 = /[-0-9A-Za-z\u3130-\u318f\uac00-\ud7a3]/;
  var RE3 = /([\u3015\u2460-\u2473\u3251-\u325f\u32b1-\u32bf])\s*(\(.+?\))\s*/g;
  function bounded(s, i) {
    return i === 0 || !RE2.test(s[i - 1]);
  }

  function num(s) {
    var n = 0, maal = false;
    return s.replace(RE1, function(u,i,s) {
      switch (u) {
      case "〕": n = 0; maal = false; break;
      case "】": n = 0; maal = true; break;
      case ":":  if (maal) n = 0;   break;
      default:   if (bounded(s, i)) return circledNumber(n = n % 50 + 1);
      }
      return u;
    });
  }

  function convert(s) {
    var w = $("#t1").text().replace(/(.+?)\d*$/, "$1");
    s = s.replace(new RegExp("^\\s*("+ w +")?\\d*\\s*"), "")

         .replace(/이음꼴\/맞이\)/g, "이음꼴/맞섬)")
         .replace(/\(딸이\)/g, "(딸림)")
         .replace(/\(도이\)/g, "(도움)")
         .replace(/\(바꿈꼴\/이바\)/g, "(바꿈꼴/이름)")
         .replace(/\(매바\)/g, "(매김)")
         .replace(/\(마침꼴\/여마\)/g, "(마침꼴/여느)")
         .replace(/\(느마\)/g, "(느낌)")
         .replace(/\(물마\)/g, "(물음)")
         .replace(/[≪《](.+?)[》≫]/g, "«$1»")

         .replace(/[「\[](명사?|이(름씨)?)[\]」]/g, "〔이〕")
         .replace(/[「\[](대명사?|대이(름씨)?|대)[\]」]/g, "〔대이〕")
         .replace(/[「\[](의존명사|매인이름씨|매이)[\]」]/g, "〔매이〕")
         .replace(/[「\[](수사?|셈씨?)[\]」]/g, "〔셈〕")
         .replace(/[「\[](동사?|움(직씨)?)[\]」]/g, "〔움〕")
         .replace(/[「\[](자동사?|제움(직씨)?)[\]」]/g, "〔제움〕")
         .replace(/[「\[](타동사?|남움(직씨)?)[\]」]/g, "〔남움〕")
         .replace(/[「\[](조동사?|도움(움직씨)?)[\]」]/g, "〔도움〕")
         .replace(/[「\[](형용사?|그(림씨)?)[\]」]/g, "〔그〕")
         .replace(/[「\[](보조형용사|도움그림씨|도그)[\]」]/g, "〔도그〕")
         .replace(/[「\[](관형사?|매김씨?)[\]」]/g, "〔매김〕")
         .replace(/[「\[](부사?|어찌씨?|어)[\]」]/g, "〔어찌〕")
         .replace(/[「\[](감탄사?|느낌씨?)[\]」]/g, "〔느낌〕")
         .replace(/[「\[](조사?|토씨?)[\]」]/g, "〔토〕")
         .replace(/[「\[](어미|씨끝)[\]」]/g, "〔씨끝〕")
         .replace(/[「\[](접사|가지)[\]」]/g, "〔가지〕")
         .replace(/[「\[](접두사?|앞(가지)?)[\]」]/g, "〔앞〕")
         .replace(/[「\[](접요사?|속(가지)?)[\]」]/g, "〔속〕")
         .replace(/[「\[](접미사?|뒷(가지)?)[\]」]/g, "〔뒷〕")
         .replace(/「(\d+)」|(^|[^-A-Za-z\u3130-\u318f\uac00-\ud7a3])(\d+)\./g,
                 function(u,u1,u2,u3) {
                   return u1? circledNumber(parseInt(u1)):
                         u2 + circledNumber(parseInt(u3));
                 })
         .replace(/[【\[](쓰임|보기)[】\]]|\u2225/g, "¶")  // ∥
         .replace(/\[(본(딧말)?|본디)\]/g, "<")
         .replace(/\[준(말)?\]/g, ">")
         .replace(/\[(동의어|한뜻말?|한)\]/g, "=")
         .replace(/\[(유의어|비슷(한말)?|비)\]|≒/g, "\u2248")  // ≈
         .replace(/\[(맞선말?|맞)\]/g, "\u2194")  // ↔
         .replace(/⇒/g, "\u2192")
         .replace(/\[큰말\]/g, "[큰]")
         .replace(/\[작(은말)?\]/g, "[작은]")
         .replace(/\[센말\]/g, "[센]")
         .replace(/\[여(린말)?\]/g, "[여린]")
         .replace(/\[높(임말)?\]/g, "[높임]")
         .replace(/\[낮(춤말)?\]/g, "[낮춤]")
         .replace(/\[갈(래말)?\]/g, "[갈래]")
         .replace(/\[(끝바꿈|덧풀이|익은말|옛말)\]/g, "【$1】")
         .replace(/\s*(\[덧붙임\]|\*\*\*덧풀이\*\*\*)\s*/, "\n【덧풀이】")
         .replace(/말】(\s*[^\u3010]+)+/g, function(u) {
           return u.replace(/;/g, ":");
         }).replace(/[\u00b9\u00b2\u00b3\u2070\u2074-\u2079]/g, function(u) {
           var c = u.charCodeAt(0);
           return c == 0xb9?
                  "1": String.fromCharCode(c - (c < 0x2070? 0x80: 0x2040));
         }); //.replace(new RegExp(w, "g"), "~");
    return num(s);     
  }

  function html(s) {
    return "<span class='maal-word'>"+ word.replace(/0*(\d+)$/, "<sup>$1</sup>")
         + "</span><span class='maal-text'>"+
      s.replace(/꿈】\s*[^\u3010\u3014]+/, function(u) {
         return u.replace(/\s*(\(.+?\))\s*/g, " <i>$1</i> ")
                 .replace(/(】)\s*/, "$1");
       })
       .replace(RE3, "$1<i>$2</i> ")
       .replace(/말】(\s*[^\u3010]+)+/g, function(u) {
         return u.replace(/([\u3011.])\s*(([^.:]|\(.*?\))+)[:]\s*/g,
                                                "$1<br><b>$2</b>: ");
       })
       .replace(/^\s*([^\u3014\u3010])/, "&nbsp;$1")
       .replace(/(〔|【)/g, "<br>$1")
       .replace(/\s*(¶|☛)\s*/g, " $1")
       .replace(/{(.+?)}/g, "<b>$1</b>")
       .replace(/((☛|=|\u2194|\u2248|\u2192|\[큰\]|\[작은\]|\[센\]|\[여린\]|\[높임\]|\[낮춤\]|\[갈래\])\s*)?(([-\uac00-\ud7a3]+)0*(\d*))/g,
        function(s,s1,s2,s3,s4,s5) {
         var refWord = s4;    // →|
         if (s5) refWord += "<sup>"+ s5 +"</sup>";
         if (s2) refWord = s1 +"<span data-l='"+ s3 +"'>"+ refWord +"</span>";
         return refWord;
       }).replace(/〔(.+?)〕/g, "<span class='maal-ps'>$1</span>") + "</span>";
  }

  function toText(s) {
    return word +
      s.replace(/꿈】\s*[^\u3010\u3014]+/, function(u) {
         return u.replace(/\s*(\(.+?\))\s*/g, " $1 ")
                 .replace(/(】)\s*/, "$1");
       })
       .replace(RE3, "$1$2 ")
       .replace(/말】(\s*[^\u3010]+)+/g, function(u) {
         return u.replace(/([\u3011.])\s*(([^.:]|\(.*?\))+)[:]\s*/g, "$1\r\n$2: ");
       })
       .replace(/^\s*([^\u3014\u3010])/, " $1")
       .replace(/(〔|【)/g, "\r\n$1")
       .replace(/\s*(¶|☛)\s*/g, " $1")
       .replace(/{(.+?)}/g, "$1");
  }

  function toHelp(s) {
    return s.replace(/\r/g, "").replace(/\n/g, "\r\n");
  }

  function toHtml(s) {
    return "<!DOCTYPE html>\r\n"+
'<html lang="ko">\r\n'+
'<head>\r\n'+
'\t<meta charset="utf-8">\r\n'+
'\t<title>'+ word +'</title>\r\n'+
'\t<meta name="viewport" content="width=device-width, initial-scale=1">\r\n'+
'\t<style>\r\n'+
".maal-word { font-family:'Malgun Gothic'; font-weight:bold; }\r\n"+
".maal-text { font-family:batang; }\r\n"+
".maal-ps { border:1.5px solid black; border-radius:4px; "+
    "padding:0 2px; margin:0 8px 0 10px; font:600 85% 'Malgun Gothic'; }\r\n"+
"[data-l] { cursor:pointer; text-decoration:underline; }\r\n"+
'\t</style>\r\n'+
'</head>\r\n'+
'<body>\r\n'+ html(s) +
'\r\n</body>\r\n'+
'</html>\r\n';
  }

  function convertText(s) {
    return s? s.replace(/ /g, "&nbsp;")
               .replace(/\r\n/g, "\n")
               .replace(/\n/g, "<br>")
               .replace(/［(.+?)］/g, "<span class='maal-box'>$1</span>")
               .replace(/#\((.+?)(\|(.+?))?\)/g, function(s,s1,s2,s3) {
                 var a;
                 if (s1[0] === "#") {
                   var c = s1.substring(1);
                   a = s1 + (s3? "' id='"+ c +"_": "_' id='"+ c);
                   s1 = "&#x21E7;";
                 } else {
                   a = s1 +"' target='_blank";
                 }
                 return "<a href='"+ a +"'>"+ (s3? s3: s1) +"</a>";
               }): "";
  }

  function diff(a, b) {
    if (!a) a = " ";
    if (!b) b = " ";
    return $("<div>").append("<div class='diff'>").prettyTextDiff({
      cleanup: false,
      originalContent: a,
      changedContent: b
    }).children().html();
  }

  function tellName(t) {
    return "<i>"+ ["더살핌","올림","버림"][t] +"&nbsp;</i>";
  }

  function accordion(o, data, collapse, n) {
    o.empty().accordion({ animate: false, icons:false,
                      collapsible: collapse,
                      heightStyle: 'content' });
    o.append(data).accordion("refresh").accordion("option", "active", n);
    o.find(".a-cmd:eq("+ n +")").show();
  }

  function push(array, element) {
    var i = array.indexOf(element);
    if (0 <= i) array.splice(i, 1);
    array.unshift(element);
    return array;
  }
    
  function arrows() {
    showIf($("#arg-l"), arg_i < arg_words.length - 1);
    showIf($("#arg-r"), arg_i > 0);
  }

  $("#arg-l,#arg-r").click(function() {
      if (arg_words.length) {
        arg_i += $(this).attr("id") == "arg-l"? 1: -1;
        $("#arg").val(arg_words[arg_i]).autocomplete("search");          
        arrows();
      }
  });

  $("#arg").autocomplete({
    source: function(request, response) {
      var s = request.term;
      if (s == "!") {
        response(words);
      } else if (s == "!!") {
        $.post("recent.php", function(data) {
          var j = 1;
          for (var i = 1, len = data.length; i < len; i++) {
            if (j <= data.indexOf(data[i])) data[j++] = data[i]; 
          }
          data.length = j;
          response(data);
        }, "json");
      } else {
        var arg = "", a = s.match(/^\s*(.*?)([@#$*])(.*?)\s*$/);
        if (a) {
          if (a[2] != "*") { // @|#|$   -- nick : id
            arg = a[3]? "n="+ encodeURIComponent(a[3]): "i="+ uid;
            switch (a[2]) {
            case "#": arg = "e"+ arg; break; // expls
            case "$": arg = "m"+ arg; break; // memos
            }
          }
          if (a[1]) {
            if (arg) arg += "&";
            arg += "a="+ encodeURIComponent(a[1]);  // after
          }
        } else {
          arg = "l="+ encodeURIComponent(s.trim());  // like
        }
        $.post("search.php", arg, function(data) {
          response(data);
        }, "json");
      }
    },
    select: function(e, ui) {
      push(arg_words, $("#arg").val());
      if (uid) findWord0(ui.item.value);
      arg_i = -1;
      arrows();
    }
  }).keydown(function(e) {
    if (e.keyCode === $.ui.keyCode.ENTER) {
      var arg = $(this).val().trim();
      $(this).val(arg);
      if (arg) {
        if (/[!@#*]/.test(arg)) {
          $("#arg").autocomplete("search");
        } else {
          findWord0(arg);
        }
      }
    }
  });

  function findWord0(arg) {
    $("#arg").blur();
    $("#editors").hide();
    findWord(arg, true);
  }

  function findWord(arg, isNew) {
    if (!arg) arg = word;
    $("#t1,#t2,#t3").hide();
    if (!arg) return;

    $.post("getWord.php", "arg=" + encodeURIComponent(arg), function(w) {
      $("#t1").text(word = arg).show();
      $("#t3").text("적바림");
      if (w.wid) {
        w.data = w.data.replace(/\r\n/g, "\n");
        expl   = [[w]];
        var sTell = word == "?"? "": tellName(w.tell);
        var  data = (sTell? html: convertText)(w.data);
        accordion($("#tab1"), fill(w.t, w.nick, sTell, data), false, 0);
        fills($("#tab2"), 0);  // 자취
        fills($("#tab3"), 1);  // 적바림
        $("#t1").css("cursor", w.uid == uid? "pointer": "default");
        if (isNew) {
          if (word == "?") {
            edit(0,0);
          } else {
            $("#t1").click();
          }
        }
        if (word != "?" && word != words[0]) {
          push(words, word);
          if (JSON) localStorage.words = JSON.stringify(words);
        }
      } else {
        expl = [];
        $("#t3").show();
        $("#tab1,#tab2,#tab3").empty();
        edit(0,-1);
      }

      function fill(t, sNick, sTell, data, i) {
        var owner = w.uid == uid;
        var bar = "<div><div class='a-cmd'><span class='a-edit b-"+
                   (i === 1? "white": (owner? "yellow": "green")) +
                  "'>&nbsp;손질&nbsp;</span>";
        if (i === 0) {
          bar += "<span class='a-view b-green'>&nbsp;보기&nbsp;</span>";
          if (owner) {
            bar += "<span class='a-accept b-yellow'>&nbsp;올림&nbsp;</span>";
          }
        }
        if (sTell && owner) {
          sNick = "<span id='w-nick'>"+ sNick +"</span>";
          sTell = "<span id='w-tell'>"+ sTell +"</span>";
        }
        bar += "</div><small>"+ t +"</small> "+ sTell +" "+ sNick;
        return bar +"</div><div><div class='a-data'>"+ data +"</div></div>";
      }

      function fills(o, i) {
        o.empty();
        var w_id = i === 0? ","+ w.id: "";
        $.post("getData.php", "arg="+ w.wid + w_id, function(array) {
          var tx = $(i? "#t3": "#t2");
          var len = array.length;
          if (len) {
            var j = -1, isEdit = eEdit.i === i && eEdit.data;
            var data = "";
            for (var index = 0; index < len; index++) {
              var a = array[index];
              if (j < 0 && isEdit && eEdit.data == a.data) j = index;
              a.data = a.data.replace(/\r\n/g, "\n");
              data += fill(a.t, a.nick, "",
                           i? convertText(a.data): diff(w.data, a.data), i);
            }
            accordion(o, data, true, j < 0? 0: j);
            tx.html("<div style='margin:-1.5px 0'>"+ (i? "적바림": "자취") +
                    "<sup>"+ array.length +"</sup></div>").show();
            if (i === 0) {
              if (0 <= j) {
                j++;
              } else if (eEdit.i === 0 && eEdit.data === w.data) {
                j = 0;
              }
              array.unshift(w);
            } else {
              o.append("<br><br>");  // 이곳을 클릭하면 새 적바림 쓰기 창이 열린다
            }
            expl[i] = array;
            if (0 <= j) {
              eEdit = array[j];
              setEditTitle(i, j);
            }
          } else if (i) {
            tx.show();
          }
        }, "json");
      }
    }, "json");
  }

  function toNum(s, i) {
    if (0 <= i) {
      var n = s.charCodeAt(i);
      if (48 <= n && n <= 57) return n - 48;
    }
    return -1;
  }

  function isWord() { return eEdit.i === 0 && word !== "?"; }

  function insert(o) {
    var d = o.attr("data-a");
    if (d) {
      var t = $("#edit").focus();
      var a = t.prop("selectionStart");
      var b = t.prop("selectionEnd");
      var v = t.val();
      var i = a + d.length;
      if (d[0] === "【") {
        d = "\n" + d;
        i++;
      } else if (10 < a && v[a - 1] === "/" && d[0] === "(") {
        d = d.substr(1);
        i--;
      } else if (d === "‘’" || d === "“”" || d === "«»" || d === "［］") {
        i--;
      } else if (d === "\u25ef") {
        var j = a - 1, n10, n = toNum(v, j);
        if (0 <= n && 0 <= (n10 = toNum(v, j - 1))) {
          n += n10 * 10;
          j--;
        }
        if (1 <= n && n <= 50) {
          d = circledNumber(n);
          a = j;
          i = j + 1;
        } else if ((n = circled(v[j]))) {
          d = n;
          i = a--;
        } else if (isWord() && bounded(v, a)) {
          d = "\u2460";
        }
      }
      v = v.substr(0, a) + d + v.substr(b);
      if (isWord()) v = num(v);
      t.val(v).prop("selectionStart", i).prop("selectionEnd", i);
    }
    return d;
  }

  function updateEdit() {
    eEdit.data = data1;
    isSame();
    findWord();
  }

  function viewIt(t, nick, data, toTab) {
    accordion($("#viewer"), "<div><small>"+ t +"</small> "+ nick +"</div>"+
      "<div><div class='a-data'>"+ (word == "?"? convertText: html)(data) +
      "</div></div>", false, 0);
    $("#t6").click();
    $("#viewer").data([toTab]);
  }

  function viewData() {
    var t = eEdit.j < 0? "새 올림말 풀이": eEdit.t;
    var n = eEdit.j < 0? nick: eEdit.nick;
    viewIt(t, n, $("#edit").val(), "#t5");
  }

  function revertData() {
    if (word === "") {
      word = word0;
      eEdit.j = -1;
    }
    $("#edit").val(isSame()? data1: eEdit.data);
    isSame();
  }

  function saveData() {
    if (isWord()) $("#edit").val(data1 = data1.trim());
    var arg, argData = "&"+ $("#edit").serialize();
    var i = eEdit.i, j;
    if (i === 0 && eEdit.j < 0) {
      $("#arg").val(word);  // 새 낱말
      arg = "&"+ $("#arg").serialize() + argData;
      $.post("addWord.php", "uid="+ uid + arg, function(id) {
        if (0 < id) {
          eEdit.j = 0;
          updateEdit();
        } else {
          info("addWord.php: "+ id);
        }
      });
    } else {
      var isWordAuthor = isWord() && expl[0][0].uid == uid;
      var len = expl[i]? expl[i].length: 0;
      for (j = len; 0 < j--;) {
        if (j !== eEdit.j && expl[i][j].data === data1) { // 같은 풀이가 있으면
          if (j && (isWordAuthor || i === 0 && word === "?")) {
            accept(j, false);
          }
          if (0 <= eEdit.j && eEdit.uid == uid && !isWordAuthor) {
            deleteData(false);
          }
          updateEdit();
          return;
        }
      }
      if (i === 0) { // 풀이: 살피는이가 손본 것은 무조건 추가 
        if (word !== "?" && expl[0][0].uid == uid) {
          j = -1;
        } else {  // 풀이: 자기 자취가 있으면 그곳에 업데이트, 없으면 추가
          for (j = len; 0 < j-- && expl[0][j].uid != uid;);
        }
      } else {  // 적바림: 손본 적바림이 자기 것이면 업데이트, 남의 것이면 추가
        j = "j" in eEdit? eEdit.j: -1;
        if (0 <= j && expl[1][j].uid != uid) j = -1;
      }
      arg = "a="+ i +",";
      if (j < 0) {
        arg += expl[0][0].wid +","+ uid + argData;
        $.post("addData.php", arg, function(id) {
          if ($.isNumeric(id)) {
            updateEdit();
          } else {
            info("addData.php: "+ id);
          }
        });
      } else {
        arg = "a="+ expl[i][j].id + argData;  // 그곳에 업데이트한다
        $.post("updateData.php", arg, function(count) {
          if ($.isNumeric(count)) {
            updateEdit();
          } else {
            info("updateData.php: "+ count);
          }
        });
      }
    }
  }

  function deleteData(isDelete) {
    var arg = "a="+ eEdit.id;         
    var deleteWord = isDelete && eEdit.i === 0 && eEdit.j === 0;
    if (deleteWord) arg += ","+ eEdit.wid;
    $.post("deleteData.php", arg, function(count) {
      if (count == "1") {
        if (isDelete) {
          var i = eEdit.i;
          eEdit = { i:i, data:"" };
          $("#edit").val("");
          if (deleteWord) {
            word0 = word; word = "";
          }
          findWord(word);
        }
      } else {
        info("deleteData.php: "+ count);
      }
    });
  }

  function convertData() {
    var o = $("#edit");
    o.val(convert(o.val()));
    isSame();
  }

  function dlData(f, ext) {
    var isHelp = word === "?";
    var d = encodeURIComponent(f($("#edit").val()));
    var e = document.createElement('a');
    e.setAttribute('href', 'data:text/plain;charset=euc-kr,' + d);
    e.setAttribute('download', (isHelp? "_도움말_": word) +"."+ ext);
    e.style.display = 'none';
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
  }

  function attachMenu(menu, to, lr) {
    $(menu).menu({
      select: function(e, ui) {
        var item = ui.item;
        if (!item.is(":has(ul)")) {  // leaf
          $(menu).hide();
          if (!insert(item)) {
            switch (item.attr("id")) {
            case    "view":
            case   "view1":    viewData();     break;
            case  "revert":  revertData();     break;
            case    "save":    saveData();     break;
            case  "delete":  deleteData(true); break;
            case "convert": convertData();     break;
            case    "dl-t": dlData(word === "?"? toHelp: toText, "txt"); break;
            case    "dl-h": dlData(toHtml, "html"); break;
            }
          }
  	    }
      }
    }).position({my:lr+" top-"+$(to).offset().top, at:lr+" bottom", of:to});

    $(menu +","+ to).hover(function() {
      $(menu).show();
    }, function() {
      $(menu).hide();
    });
  }

  $("#menu span").hover(function() {
    $(this).addClass("ui-state-focus");
  }, function() {
    $(this).removeClass("ui-state-focus");
  });

  attachMenu("#m0", "#s0", "left");
  attachMenu("#m2", "#s2", "left");
  attachMenu("#m3", "#s3", "right");
  attachMenu("#m4", "#s4", "left");
  attachMenu("#m5", "#s5", "right");
  attachMenu("#m6", "#s6", "right");
  $("#menu>span[data-a]").click(function() { insert($(this)); });

  function showIf(o, condition) {
    if (condition) {
      o.show();
    } else {
      o.hide();
    }
  }

  function isDeletable() {
    return eEdit.uid == uid &&
          (eEdit.i || eEdit.j || expl[0][0].tell == 2 && expl[0].length === 1 &&
                                (expl.length === 1 || expl[1].length === 0));
  }

  $("#s0").mouseover(function() {
    showIf($("#view"),   isSame() && eEdit.data && eEdit.i === 0 && word != "?");
    showIf($("#view1"), !isSame() &&      data1 && eEdit.i === 0 && word != "?");
    showIf($("#revert"), eEdit.data != data1);
    showIf($("#save"),   word && !isSame() && data1.trim());
    showIf($("#delete"), isDeletable());
    showIf($("#convert"), eEdit.i === 0 && word != "?" && $("#edit").val().trim());
    showIf($("#download"), downloadable && eEdit.i === 0 && $("#edit").val().trim());
    showIf($("#dl-h"), downloadable && word !== "?");
  });

  $("#s6").mouseover(function() { showIf($("#box"), word === "?"); });

  $("#tabs").tabs();

  function tx() { return eEdit.i? "#t3": (0 < eEdit.j? "#t2": "#t1"); }

  function setEditTitle(i, j) {
    eEdit.i = i;
    eEdit.j = j;
    $("#t1,#t2,#t3").removeAttr("title");
    $(tx()).attr("title", eEdit.nick +" "+ eEdit.t);
  }

  function edit(i, j) {
    $("#s0").css("background-color", ["#ffa","#bfc","white"][i]);
    if (i && --i === 0) j++;
    $("#edit").attr("placeholder", i? "":
      "[소리] (한자/밑말)\n"+
      "〔씨갈래〕(말본)\u2460풀이. ¶쓰임. [이웃]... ... \u2461 . . .\n"+
      "〔씨갈래〕\u2460(말본)풀이. ¶쓰임. [이웃]... ... \u2461(말본) . . ."+
      "\n   .  .  .\n"+
      "【덧풀이】\n   .  .  .\n【익은말】\n익은말: 풀이.\n"+
      "【옛말】\n옛말: 풀이.\n옛말:\u2460풀이. \u2461풀이.\n"+
      "【끝바꿈】(이음꼴/맞섬)... ... (딸림)... ... (도움)... ...\n   .  .  .\n");
    if (j < 0) {
      eEdit = { data:"", nick:nick, t:"" };
    } else {
      eEdit = expl[i][j];
    }
    setEditTitle(i, j);
    $("#t5").click();
    $("#edit").val(data1 = eEdit.data).focus().scrollTop(0);
  }

  function isSame() {
    var o = $("#edit"), v = o.val(), v1;
    if (isWord() && v !== (v1 = num(v))) {
      var i = o.prop("selectionStart"), j = o.prop("selectionEnd");
      o.val(v = v1).prop("selectionStart", i).prop("selectionEnd", j);
    }
    var same = v === eEdit.data;
    if (!same) data1 = v;
    $("#tabs").tabs("option", "disabled", same? []: [0,1,2,3]);
    showIf($("#count1,#count2,#count3,#arg,#exit_div"), same);
    return same;
  }

  $("#edit").blur     (function() { isSame(); });
  $("#menu").mouseover(function() { isSame(); });

  $("#edit").keydown(function(event) {
    if (event.ctrlKey || event.metaKey) {
      var key = String.fromCharCode(event.which).toLowerCase();
      if (key == 's' || key == 'z' || key == 'q') { // || key == 'w') {
        event.preventDefault();
        switch (key) {
        case 's': if (!isSame() && data1.trim()) saveData(); break;
        case 'z': revertData(); break;
        case 'q': convertData(); break;
//        case 'w': viewData(); break;
        }
        return false;
      }
    }
  });

  $("#tab2").on("contextmenu", ".ui-accordion-header", function(event) {
     $("#mc2").focus().draggable().show()
              .offset({top:event.pageY, left:event.pageX});
     return false;
  });

  $("#t1,#t2,#t3").click(function() {
    $("#t1,#t2,#t3").removeAttr("title");
  });
  
  $("#t1").dblclick(function() {
    if (expl[0] && expl[0][0] && expl[0][0].uid == uid) {
      var oldWord = $(this).text();
      resetError($("#word input"));
      $("#word").draggable().show();
      $("#word>input").val(oldWord).autocomplete("search");
    }
    return false;
  }).contextmenu(function() {
    $(this).dblclick();
    return false;
  });

  $("#t3").dblclick(function() {
    $("#tab3").click();
  }).contextmenu(function() {
    $(this).dblclick();
    return false;
  });
  
  $("#tab3").click(function() {
    if (uid) edit(2,-1);
  });

  $("#t4").click(function() {
    $.post("getHelp.php", function(help) {
      $("#tab4").html(convertText(help));
    });
  }).contextmenu(function() {
    $(this).dblclick();
    return false;
  });

  $("#t4,#tab4").dblclick(function() {
    if (uid) {
      if (word === "?") {
        edit(0,0);
      } else {
        findWord("?", true);
      }
    }
    return false;
  });

  $("#tab1").on("click", "#w-nick", function() {
    resetError($("#editor input"));
    $("#editor").focus().draggable().show();
  }).on("click", "#w-tell", function() {
    var o = $(this);
    var e = expl[0][0];
    var t = (e.tell + 1) % 3;
    $.post("updateTell.php", "wid="+ e.wid +"&tell="+ t, function(code) {
      if (code == '1') {
        o.html(tellName(e.tell = t));
      } else {
        info("updateTell.php: "+ code);
      }
    });
  });

  $("#tab1,#viewer").on("click", "[data-l]", function() {
    findWord($(this).attr("data-l"));
    $("#t1").click();
  });

  $("#word,#editor").on("click", ".x-close", function() {
    $(this).parent().hide().children("input").blur();
  });

  $("#tab2").on("click", ".a-view", function() {  // 보기
    var o = $(this).parent().parent(); 
    var i = o.index()/2;
    var e = expl[0][i+1];
    viewIt(e.t, e.nick, e.data, "#t2");
    o.parent().accordion("option", "active", i);
  }).on("click", ".a-accept", function() {        // 올림
    accept($(this).parent().parent().index()/2 + 1, true);
  });

  $("#viewer").dblclick(function() {
    if ($("#viewer").data()[0] === "#t2") {
      edit(0, 1 + $("#tab2").accordion("option", "active"));
    }
    $("#t5").click();
  }).on("click", ".ui-accordion-header", function() {
    $($(this).parent().data()[0]).click();
  });

  $("#tab1,#tab2,#tab3").on("click", ".a-edit", function() {
    var o = $(this).parent().parent();
    edit(o.parent().index() - 1, o.index()/2);
    o.parent().accordion("option", "active", o.index()/2);
    return false;
  }).on("dblclick", ".ui-accordion-content", function() {
    edit($(this).parent().index() - 1, ($(this).index() - 1)/2);
    return false;
  }).on("click", ".ui-accordion-content", function() {
    return false;
  });

  $("#tab2,#tab3").on("click", ".ui-accordion-header", function() {
    var o = $(this).parent();
    var i = o.accordion("option", "active");
    o.find(".a-cmd").hide();
    if (i !== false) {
      o.find(".a-cmd:nth("+ i +")").show();
    }
    return false;
  });

  $("#word>input").keydown(function(e) {
    if (e.keyCode === $.ui.keyCode.ENTER) $(this).blur();
  }).autocomplete({source: "searchWord.php"})
    .blur(function() { newWord(false); });

  $("#editor>input").keydown(function(e) {
    if (e.keyCode === $.ui.keyCode.ENTER) $(this).blur();
  }).autocomplete({source: "searchUser.php"})
    .blur(function() { newEditor(false); });

  $("#word > .b-shade").click(function() {   newWord(true); });
  $("#editor>.b-shade").click(function() { newEditor(true); });

  function newWord(isUpdate) {
    var o = $("#word>input"), oVal = o.val().trim();
    o.val(oVal);
    resetError(o);
    if (!oVal || oVal == word) {
      if (isUpdate) o.parent().hide(); 
    } else {
      var arg = o.serialize();
      if (isUpdate) arg += "&wid="+ expl[0][0].wid;
      $.post("updateWord.php", arg, function(code) {
        if (code == '1') {
          findWord(oVal, true);
          o.parent().hide();
        } else if (code == '2') {
          setError(o, "이 올림말은 있습니다.");
        } else if (code != '3') {
          info("updateWord.php: "+ code);
        }
      });
    }
  }

  function newEditor(isUpdate) {
    var e = expl[0][0];
    var o = $("#editor>input"), oVal = o.val().trim();
    o.val(oVal);
    resetError(o);
    if (!oVal || o.val() == e.nick) {
      if (isUpdate) o.parent().hide();
    } else {
      var arg = o.serialize();
      if (isUpdate) arg += "&uid="+ uid +"&wid="+ e.wid;
      $.post("updateEditor.php", arg, function(code) {
        if (code == '1') {
          findWord();
          o.parent().hide();
        } else if (code == '2') {
          setError(o, "등록되지 않았습니다.");
        } else if (code != '3') {
          info("updateEditor.php: "+ code);
        }
      });
    }
  }

  function accept(j, isAccept) {
    var e = expl[0][j];
    var userId = e.uid == uid || word == '?'? 0: uid;
    $.post("updateData.php", "a="+ e.id +","+ userId, function(count) {
      if (count == '1') {
        if (isAccept) findWord(word, true);
      } else {
        info("updateData.php: "+ count);
      }
    });
  }

  $("#edit").val(eEdit.data = "");

  $("#count1").data({ s:"#count1", x:"@", a:"b-yellow" });
  $("#count2").data({ s:"#count2", x:"#", a:"b-green" });
  $("#count3").data({ s:"#count3", x:"$", a:"b-white" });

  $("#count1,#count2,#count3").click(function() {
    var o = $(this), data = o.data();
    $.post("getC"+ data.s.substring(2) +"a.php", function(array) {
      var tbody = $("#editors tbody").empty(), sum = 0;
      for (var i = 0, len = array.length; i < len; i++) {
        var a = array[i];
        tbody.append($("<tr>").data([data.x + a[0]])
             .append($("<td>"+ a[0] +"</td><td><i>"+ a[1] +"</i></td>")));
        sum += parseInt(a[1]);
      }
      o.text(sum);
      $("#editors thead td").removeClass().addClass(data.a);
      $("#editors").show()
               .position({ my:"right top", at:"right+8 bottom+2", of:data.s });
    }, 'json');
    return false;
  });

  $("#h1").click(function() {
    if (uid) {
      $.post("getUsers.php", function(array) {
        var o = $("#list tbody").empty().data([false, false, true, false]);
        $("#list sup:eq(0)").text(array.length);
        for (var i = 0, len = array.length; i < len; i++) {
          var a = array[i];
          var row = $("<tr><td>"+ a[0] +
                      "</td><td><input type='checkbox'></td><td>"+ a[1] +
                      "</td><td>"+ a[2] +"</td></tr>");
          row.data([a[3]]);
          o.append(row);
        }
        $("#list").show().find("input").focus();
      }, 'json');
    }
    return false;
  });

  $("#ans     .x-close").click(function() { $("#ans").hide(); });
  $("#toSure  .x-close").click(function() { $("#toSure").hide(); });
  $("#list    .x-close").click(function() { $("#list").hide(); });
  $("#editors .x-close").click(function() { $("#editors").hide(); });

  $("#editors>tbody").on("click", "tr", function() {
    $("#arg").val($(this).data()[0]).autocomplete("search");
  }).on("mouseenter", "tr", function() {
    $(this).addClass("b_grey");
  }).on("mouseleave", "tr", function() {
    $(this).removeClass("b_grey");
  });

  function setListCheckbox(b) {
    $("#list tbody>tr").each(function() {
      $(this).find("[type=checkbox]").prop("checked", b);
    });
  }

  $("#list thead [type=checkbox]").change(function() {
    setListCheckbox($(this).prop("checked"));
  });

  function toList() {
    var to = [];
    $("#list tbody>tr input:checked").each(function() {
      var tr = $(this).parent().parent();
      var id = tr.data()[0];
      if (id != uid) {
        to.push([id, tr.find("td:first").text()]);
      }
    });
    return to;
  }

  $("#notice").click(function() {
    if (toList().length) {
      $("#list .x-close").hide();
      $("#note-form").width($("#list").width()).draggable({ cursor:"move" })
        .show().position({ my:"left top", at:"left-1 top", of:"#list tbody" })
        .data([toList, "#list"]);
      setNoteSize();
    }
    return false;
  });

  function setNoteSize() {
    var formWidth = $("#note-form").width();
    $("#subj").width(formWidth - 14);
    $("#note").width(formWidth - 11);
    $("#note").height($(window).height() - $("#note").offset().top - 2);
  }

  $("#note-form .x-close").click(function() {
    $($("#note-form").hide().data()[1] + " .x-close").show();
  });

  $("#send-note").click(function() {
    if ($("#subj").val().trim() || $("#note").val().trim()) {
      var subj0 = $("#subj").val(), note0 = $("#note").val();
      var ids = "";
      $("#note-form").data()[0]().forEach(function(to) {
        if (to[0] != uid) ids += ","+ to[0];
      });
      if (ids) {
        send(ids.substring(1));
        $("#note-form .x-close").click();
      }
    }

    function send(toId) {
      var m = nick +" 님이 알립니다";
      var subj = encodeURIComponent(subj0? subj0: m);
      var note = encodeURIComponent(subj0? "("+ m +".)\n\n"+ note0: note0);
      var re  = encodeURIComponent(nick);
      var rea = encodeURIComponent(mail);
      var arg = "id="+ toId +"&subj="+ subj +"&note="+ note +"&re="+ re +"&rea="+ rea;
      $.post("sendMail.php", arg, function(rc) {
        if (rc) info("sendMail.php: "+ rc);
      });
    }
  });

  $("#list tbody").on("click", "td", function() {
    var index = $(this).index();
    if (index != 1) {
      $("#list thead [type=checkbox]").prop("checked", false);
      setListCheckbox(false);
      var tbody = $(this).parents("tbody");
      var  data = tbody.data();
      var  desc = data[index];
      data[index] = !data[index];
      tbody.data(data);
      var  rows = tbody.find("tr").toArray().sort(cmp);
      for (var len = rows.length, r = 0; r < len; r++) {
        tbody.append(rows[r]);
      }
    }
    
    function cmp(row1, row2) {
      var diff = cmpText(index);
      if (diff === 0) diff = cmpText(index == 2? 0: 2);
      return desc? -diff: diff;

      function cmpText(columnIndex) {
        var a = text(row1), b = text(row2);
        return $.isNumeric(a) && $.isNumeric(b)? a - b: a.localeCompare(b);
    
        function text(row) {
          return $(row).children("td").eq(columnIndex).text();
        }
      }
    }
  });

  $(window).resize(function() {
    if ($("#exit").is(":visible")) h1();
    var h = $(window).height();
    $("#tab1,#tab2,#tab3,#tab4,#viewer").height(h - 78);
    $("#edit").height(h - 109);
    $("#list tbody").css("max-height", h - 72);
    $("#editors tbody").css("max-height", h - 67);
    $(".ui-autocomplete").css("max-height", h - 40);
    if ($("#note-form").is(":visible")) setNoteSize();
  }).resize();

  $("body").css("visibility", "visible").tooltip({ show:false, hide:false });

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
