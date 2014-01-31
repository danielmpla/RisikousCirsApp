/**
 * Created by Daniel on 15.01.14.
 */

var keyCommentStore = [];

function getParam(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return(false);
}

function printComment(depth, jsonObject, parentId) {
    var output = "";
    $.each(jsonObject, function(idA, all) {
        var id;
        var author;
        var timestamp;
        var text;
        var comment;
        var button;
        var jsonComment;
        
        $.each(all, function(key, value) {
            if (key == "author") {
                author = '<span class="text">Autor: ' + value + '</span><br/>';
            }
            if (key == "timeStamp") {
                timestamp = '<span class="text">Zeitpunkt: ' + value + '</span><br/>';
            }
            if (key == "text") {
                if (depth == 0) {
                    text = '<span class="text">Kommentar:<br/>' + value + '</span><br/>';
                } else {
                    text = '<span class="text">Antwort:<br/>' + value + '</span><br/>';
                }
            }
            if (key == "id"){
                id = value;
            }
            if (key == "comment"){
                jsonComment = value;
            }
        });
        keyCommentStore.push({"id": id, "comment": all});
        if (depth + 1 < 3 && jsonComment instanceof Object) {
            comment = '<span class="text headline">Antworten<br/></span>' + printComment(depth + 1, jsonComment, id);
        }
        if (depth != 3) {
            button = '<input type="button" onclick="addComment(' + id + ', ' + parentId + ')" value="Add Comment"></input><br/>';
        }
        if (comment != null) {
            output = author + timestamp + text + button + comment;
        } else {
            output = author + timestamp + text + button;
        }
    });
    return output;
}

function addComment(ownId, parentId) {
    var jsonComment;
    
    $.each(keyCommentStore, function (arrKey, jsonObject){
       if(jsonObject.id == ownId.toString()){
           jsonComment = jsonObject.comment;
       } 
    });
    
    $('#report').addClass("hidden");
    $('#comment').removeClass("hidden");

    //zu kommentierendes Kommentar anzeigen
     $('#comment').append('<span class="text">Autor: ' + jsonComment.author + '</span><br/>');
     $('#comment').append('<span class="text">Zeitpunkt: ' + jsonComment.timeStamp + '</span><br/>');
     $('#comment').append('<span class="text">Kommentar:<br/>' + jsonComment.text + '</span><br/><br/>');
     
    //Kommentar Felder
    
    $('#comment').append('<span class="text">Autor:</span><br/>');
    $('#comment').append('<input type="text" name="name"><br/>');
    $('#comment').append('<span class="text">Kommentar:</span><br/>');
    $('#comment').append('<textarea id="comment" rows="6"></textarea><br/>');
    
    $('#comment').append('<input class="menuButton" type="submit" value="Absenden" onclick="sendComment(' + parentId + ')">');
    }

function sendComment(parentId){
    var answer = false;
    if(parentId == getParam("id")){
        answer = false;
    }else{
        answer = true;
    }
    
    var author = "";
    author = $("input:text[name ='name']").val();
    
    var text = "";
    text = $("#comment").val();
    
    if(answer){
        $.ajax({
		headers : { Accept : "application/json; charset=utf-8", "Content-Type" : "application/json; charset=utf-8" },
        	type: "POST",
        	url: "http://141.46.136.3:8080/RisikousRESTful/rest/comment/addAnswer",
        	data: JSON.stringify({"comment": {"id": parentId, "author": author, "text": text}}),
        	success: function (data, textStatus, jqXHR){
        				commentSuccessPage();
        			 },
                error: function (data, textStatus, jqXHR){
                    alert(JSON.stringify({"comment": {"id": parentId, "author": author, "text": text}}));
                    alert(JSON.stringify(data));
                },
        	dataType: "json"
        });
    }else{
        $.ajax({
		headers : { Accept : "application/json; charset=utf-8", "Content-Type" : "application/json; charset=utf-8" },
        	type: "POST",
        	url: "	http://141.46.136.3:8080/RisikousRESTful/rest/publication/addComment",
        	data: JSON.stringify({"comment": {"id": parentId, "author": author, "text": text}}),
        	success: function (data, textStatus, jqXHR){
        				commentSuccessPage();
        			 },
                error: function (data, textStatus, jqXHR){
                    alert(JSON.stringify(data));
                },
        	dataType: "json"
        });
    }
}

function commentSuccessPage(){
    $("#comment").html('<span class="text">Ihr Kommentar wurde erfolgreich gesendet!</span><br/>');
    $("#comment").html('<input type="button" class="menuButton" value="Zurück zur Meldung" onclick="window.location.reload()">');
}

var json;

$(document).ready(function() {
    var id = getParam("id");
    $("#headline").text("Mitteilung " + id);
    $.getJSON("http://141.46.136.3:8080/RisikousRESTful/rest/publication/id/" + id, function(data) {
        json = data;
        $.each(data, function(id, value) {
            if (id == 'title') {
                $('#report').append('<span class="text headline">Titel</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'incidentReport') {
                $('#report').append('<span class="text headline">Ereignisbeschreibung der Veröffentlichung</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'minRPZofReporter') {
                $('#report').append('<span class="text headline">minimale RPZ des Meldenden</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'avgRPZofReporter') {
                $('#report').append('<span class="text headline">durchschnittliche RPZ des Meldenden</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'maxRPZofReporter') {
                $('#report').append('<span class="text headline">maximale RPZ des Meldenden</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'minRPZofQMB') {
                $('#report').append('<span class="text headline">minimale RPZ des QMBs</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'avgRPZofQMB') {
                $('#report').append('<span class="text headline">durchschnittliche RPZ des QMBs</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'maxRPZofQMB') {
                $('#report').append('<span class="text headline">maximale RPZ des QMBs</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'differenceStatement') {
                $('#report').append('<span class="text headline">Begründung der Differenz zwischen den RPZs des Meldenden und denen des QMBs</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'category') {
                $('#report').append('<span class="text headline">Kategorie der Veröffentlichung</span><br/><span class="text">' + value + '</span><br/>');
            }
            if (id == 'action') {
                $('#report').append('<span class="text headline">Maßnahme der Veröffentlichung</span><br/><span class="text">' + value + '</span><br/>');
            }
        });
        $.getJSON("http://141.46.136.3:8080/RisikousRESTful/rest/comments/id/" + id, function(commentData) {
//            alert(JSON.stringify(commentData));
            if (commentData.comment.length != 0) {
                $('#report').append('<span class="text headline">Kommentare</span></br>');
                var comments = "";
                comments = printComment(0, commentData.comment, id);
                $('#report').append(comments);
            }
        });
    });
});