var params;
var command;
var url = "";
var protocol = "";
var websocket = "";
var apitable = "";
var room = "";
var version = "0.1 EXTREME BETA";
var name = "SmallChat Text Based Client";
roomtitle = "???";
var charname = "???";
var prion = 'off';
var globalpri = 'CharacterERROR';
var div = document.getElementById('textlog');

function Log(S) {
    console.log(S);
}

function websocketstarter() {
    websocket = new WebSocket(url);
    websocket.onopen = function (evt) {
        printtoscreen('<font style="color:green">Connected!</font>');
        identify();
    };
    websocket.onclose = function (evt) {
        printtoscreen('<font style="color:orange">Disconnected!</font>');
    };
    websocket.onmessage = function (evt) {
        parseSent(evt.data);
    };
    websocket.onerror = function (evt) {
        printtoscreen('<strong><font style="color:red">WEBSOCKET ERROR: ' + evt.data + '</font></strong>');
    };
}

function printtoscreen(text) {
    Log(text);
    var objDiv = document.getElementById("textlog");
    div.innerHTML = div.innerHTML + '<br/>' + convertbbcode(text);
    objDiv.scrollTop = objDiv.scrollHeight;
}
//Credits to Kali Trixtan for command parser bits.
function parseSent(string) {
    if (string != 'PIN') {
        command = string.slice(0, 3);
        command = String(command);
        params = string.slice(4, string.length);
        params = JSON.parse(params);
        execute(command, params);
        return 'Check params and command for data!';
    } else {
        keepalive();
    }
}

function keepalive() {
    sendtoserver("PIN");
    Log("Keeping Alive");
}

function getapikey() {
    //$.post("http://www.f-list.net/json/getApiTicket.php", function(data,status){Log("Data: " + data + "\nStatus: " + status)});
}

function convertapikeytotable() {
    apitable = JSON.parse(getapikey());
    Log(apitable.characters[1]);
}

function sendtoserver(mesg) {
    Log(mesg);
    websocket.send(mesg);
}

function sendmessage() {
    var text = document.getElementById("usertext");
    if (text.value.charAt(0) == "/") {
        slashcommand(text.value, text);
        text.value = "";
    } else {
        printtoscreen('[' + room + '] You: ' + text.value);
        normalchat(text.value);
        text.value = "";
    }
}

function connecttoserver() {
    var text = document.getElementById("server");
    printtoscreen('Connecting to server: ' + text.value);
    url = text.value;
    websocketstarter();
}

function identify() {
    var apikey = document.getElementById("APIkey").value;
    var character = document.getElementById("Character").value;
    var account = document.getElementById("Account").value;
    charname = document.getElementById("Character").value;
    sendtoserver('IDN { "method": "ticket", "account": "' + account + '", "ticket": "' + apikey + '", "character": "' + character + '", "cname": "' + name + '", "cversion": "' + version + '" }');
    Log("Sent ID");
}

function disconnect() {
    websocket.close();
}

function normalchat(mesg) {
    if (room == "") {
        noroomerror();
    } else {
    	sendtoserver('MSG { "channel": "' + room + '", "message": "' + mesg.replace(/\"/g, '\\"') + '" }');
    	}
}

function noroomerror() {
    printtoscreen('<strong><font style="color:red">CLIENT ERROR: Please join a room.</font></strong>');
}

function slashcommand(mesg, text) {
    var command;
    Log('Slash command found');
    command = slashslice(mesg);
    if (command[0] == '/join') {
        sendtoserver('JCH {"channel": "' + command[1] + '"}');
        printtoscreen('[Client] You joined ' + command[1]);
        room = command[1];
    } else if (command[0] == '/me') {
        sendtoserver('MSG { "channel": "' + room + '", "message": "' + mesg.replace(/\"/g, '\\"') + '" }');
        printtoscreen('[' + room + '] <em>' + charname + ' ' + command[1] + '</em>');
    } else if (command[0] == '/leave') {
        sendtoserver('LCH {"channel": "' + command[1] + '"}');
        printtoscreen('[Client] You left ' + command[1]);
    } else if (command[0] == '/switch') {
        printtoscreen('[Client] Switched focus to ' + command[1]);
        room = command[1];
    } else if (command[0] == '/priv') {
        var whotosend = quoteslice(command[1]);
        var messagetosend = command[1];
        messagetosend = messagetosend.slice(slicepoint2 + 2, messagetosend.length);
        if (messagetosend.charAt(0) == "/") {
            printtoscreen('<font style="color:blue">[PRIVATE] !' + whotosend + '! <em>' + charname + ' ' + slashslice(messagetosend)[1] + '</em></font>');
        } else {
            printtoscreen('<font style="color:blue">[PRIVATE] !' + whotosend + '! You: ' + messagetosend + '</font>');
        }
        sendtoserver('PRI { "recipient": "' + whotosend + '", "message": "' + messagetosend.replace(/\"/g, '\\"') + '" }');
    } else if (command[0] == '/') {
        printtoscreen('[CLIENT] Commands that can be done');
        printtoscreen('[CLIENT] /join [Channel] - Join a channel');
        printtoscreen('[CLIENT] /leave [Channel] - Leave a channel');
        printtoscreen('[CLIENT] /switch [Channel]- Switch channels');
        printtoscreen('[CLIENT] /priv "[Character]" [Message] - Send a private message to a character.');
        printtoscreen('[CLIENT] /cls all - Clear screen');
        printtoscreen('[CLIENT] You are running SmallChat V.0.1');
    } else if (command[0] == '/cls'){
    	if (command[1] == 'all'){
    		div.innerHTML = '';
    	} else {
    		printtoscreen('<strong><font style="color:red">CLIENT ERROR: Malformed Command' + command + '</font></strong>');
    	}
    } else {
    	printtoscreen('<strong><font style="color:red">CLIENT ERROR: "' + command[0] + '"' + " isn't a valid command</font></strong>");
    }

}

function slashslice(com) {
    var slicepoint;
    var a;
    var b;
    var finished;
    if (com.indexOf(' ') !== -1) {
        slicepoint = com.indexOf(' ');
        a = com.slice(0, slicepoint);
        b = com.slice(slicepoint + 1, com.length);
        finished = [a.toLowerCase(), b];
        return finished;
    } else {
        return com;
    }
}

function quoteslice(com) {
    if (com.indexOf('"') !== -1) {
        var res = [];
        for (var i = 0; i < com.length; i++) {
            if (com[i] === '"') {
                res.push(i);
            }
        }
        slicepoint1 = res[0];
        slicepoint2 = res[1];
        com = com.slice(slicepoint1 + 1, slicepoint2);
        return com;
    } else {
        return com;
    }
}

function unknowncommand(command) {
    Log("<strong>Can't handle command: " + command + '</strong>');
}

//**********************************
//COMMAND BANK
//**********************************

function execute(com, para) {
    if (dictionary[com] === undefined) {
        //unknowncommand(com);
    } else {
        dictionary[com](para);
    };
}
dictionary = {
    MSG: function (para) {
        if (para.message != undefined) {
            if (para.message.charAt(0) == "/") {
                printtoscreen('[' + para.channel + '] <em>' + para.character + ' ' + slashslice(para.message)[1] + '</em>');
            } else {
                printtoscreen('[' + para.channel + '] ' + para.character + ': ' + para.message);
                //if(slashslice(para.message)[0]=='!date' && para.message.charAt(0)=='!') {
                //	sendtoserver('MSG { "channel": "' + room + '", "message": "BOT: ' + Date(slashslice(para.message)[1]) + '" }');
                //}
            }
        } else {
            return
        }
    },
    LCH: function (para) {
        if (params.character == charname) {
            printtoscreen('[Client] You have left ' + para.channel);
        }
    },
    JCH: function (para) {
        if (params.character == charname) {
            printtoscreen('[Client] You have joined ' + para.channel);
        }
    },
    PRI: function (para) {
        document.getElementById('pm').play();
        if (para.message != undefined) {
            if (para.message.charAt(0) == "/") {
                printtoscreen('<font style="color:blue">[PRIVATE] <em>' + para.character + ' ' + slashslice(para.message)[1] + '</em></font>');
            } else {
                printtoscreen('<font style="color:blue">[PRIVATE] ' + para.character + ': ' + para.message + '</font>');
            }

        }
    },
    ERR: function (para) {
        if (para.number != undefined) {
            printtoscreen('<strong>SERVER ERROR: ' + para.message + ' ' + para.number + '</strong>');
        } else {
            return
        }
    },
    ICH: function (para) {
        if (para.title != undefined) {
            roomtitle = params.title;
        } else {
            return
        }
    },
    HLO: function (para) {
        printtoscreen('<strong>SERVER HELLO: ' + para.message + '</strong>');
    },
    BRO: function (para) {
    	printtoscreen('<h1><strong><font style="color:red">ADMIN BROADCAST: ' + para.message + '</h1></strong></font>');
    },
    CKU: function (para) {
    	printtoscreen('<strong><font style="color:red">[' + para.channel + '] ' + para.operator + ' has kicked ' + para.character + '</font></strong>');
    }
};
//******
//BBCODE PARSER BY SOME GUY EDITED BY ME BECAUSE I HAVE NO TIME FOR THAT
//******
function convertbbcode(cmd) {
    $str = cmd;

    //The array of regex patterns to look for
    $format_search = [
        /\[b\](.*?)\[\/b\]/ig,
        /\[i\](.*?)\[\/i\]/ig,
        /\[u\](.*?)\[\/u\]/ig,
        /\[url\](.*?)\[\/url\]/ig,
        /\[url=(.*?)\](.*?)\[\/url\]/ig,
        /\[sup](.*?)\[\/sup\]/ig,
        /\[sub](.*?)\[\/sub\]/ig];
    // NOTE: No comma after the last entry

    //The matching array of strings to replace matches with
    $format_replace = [
        '<strong>$1</strong>',
        '<em>$1</em>',
        '<span style="text-decoration: underline;">$1</span>',
        '<a href="$1">$1</a>',
        '<a href="$1">$2</a>',
        '<sup>$1</sup>',
        '<sub>$1</sub>'];

    //Perform the actual conversion
    for (var i = 0; i < $format_search.length; i++) {
        $str = $str.replace($format_search[i], $format_replace[i]);
    }
    return $str;
}
printtoscreen("Client ready. Type in '/' for help.");