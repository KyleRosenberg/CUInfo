var socket;
var username;
var password;

function submitForm(){
    var em = document.getElementById("email");
    var pw = document.getElementById("password");
    $("#loginload").removeClass("hidden");
    socket= new WebSocket('ws://104.197.171.2:1337');
    username = em.value;
    password = pw.value;
    socket.onopen= function() {
        getInfoForSession(username, password, "Fall 2017");
    };
    socket.onmessage= function(s) {
        if (s.data instanceof Blob){
            reader = new FileReader()
            reader.onload = () => {
                var res = JSON.parse(reader.result);
                if ("error" in res){
                    $("#fail").text(res["error"]);
                    $("#fail").removeClass("hidden");
                    socket.close();
                } else {
                    $("#fail").addClass("hidden");
                    $("#login").css("display", "none");
                    $("#info").css("display", "");
                    for (var i = 0; i<res.length; i++){
                        var clss = res[i];
                        var classInfo = `<td>${clss["name"]} (${clss["type"]})<br />${clss["department"]} ${clss["classCode"]}-${clss["section"]}</td>`;
                        var timeInfo = `<td>${clss["days"]}<br />${clss["startTime"]}-${clss["endTime"]}</td>`;
                        var inst = clss["instructor"];
                        var instructorInfo = `<td>${inst["firstName"]} ${inst["lastName"]}</td>`;
                        var creditInfo = `<td>${clss["credits"]}</td>`;
                        var statusInfo = `<td>${clss["status"]}</td>`;
                        if (clss["grade"]==undefined){
                            clss["grade"] = "";
                        }
                        var gradeInfo = `<td>${clss["grade"]}</td>`;
                        $("#table tbody").append("<tr>" + classInfo + timeInfo + instructorInfo + creditInfo + statusInfo + gradeInfo + "</tr>");
                    }
                    $("#selectsesh").removeClass("active");
                }
            }
            reader.readAsText(s.data);
        }
    };
}

function getInfoForSession(un, pw, ss){
    socket.send(JSON.stringify({
        username:un,
        password:pw,
        session:ss
    }));
}

window.onload = function(){
    $('.ui.dropdown').dropdown({
        onChange:function(){
            $("#table tbody tr").remove();
            $("#selectsesh").addClass("active");
            getInfoForSession(username, password, document.getElementById("session").value);
        }
    });
    document.getElementById("password").onkeydown = function(){
        if(window.event.keyCode=='13'){
            submitForm();
        }
    }
    document.getElementById("signin").onclick = function(){
        submitForm();
    }
}
