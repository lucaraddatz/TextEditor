const { ipcRenderer, ipcMain } = require('electron')
const { dialog } = require('electron').remote
const fs = require("fs");
const fontList = require('font-list');

var systemFonts = [];
var lastOpened = {};
var lastFile = "";

function checkWords() {

    if (ele("articleText").innerHTML == lastOpened.content && ele("articleHeader").innerHTML == lastOpened.header && ele("articleAuthor").innerHTML == lastOpened.author) {
        if (ele("articleShort").getAttribute("unsaved") != null) {
            ele("articleShort").removeAttribute("unsaved");
        }
        console.log("Identical");
    } else {
        if(ele("articleShort").getAttribute("unsaved") == null) {
            ele("articleShort").setAttribute("unsaved", "");
        }
        console.log("Changed.");
    }

    var p = document.getElementById('articleText').innerText;
    try {
        document.getElementById('articleCount').innerText = p.match(/\S+/g).length + " words";
    } catch (error) {
        document.getElementById('articleCount').innerText = 0 + " words";        
    }

    try {
        // $('pre code').each(function (i, block) {
        //     hljs.highlightBlock(block);
        // });

        // jQuery(() => {
        //     $('pre code').each(function (i, block) {
        //         hljs.highlightBlock(block);
        //     });
        // })

        // var c = document.getElementsByClassName("code");
        // console.log(c);

    } catch (error) {
        console.log(error);
    }

    // $('pre code').each(function (i, block) {
    //     hljs.highlightBlock(block);
    // });

}

function start() {
    window.ipc = window.ipc || {}

    document.getElementById("smallButton2").style.display = "none";

    document.getElementById("minimizeButton").addEventListener("click", () => {
        minimize();
    });
    document.getElementById("smallButton").addEventListener("click", () => {
        unMaximize();
        document.getElementById("smallButton").style.display = "none";
        document.getElementById("smallButton2").style.display = "block";
    });
    document.getElementById("smallButton2").addEventListener("click", () => {
        maximize();
        document.getElementById("smallButton2").style.display = "none";
        document.getElementById("smallButton").style.display = "block";
    });
    document.getElementById("xButton").addEventListener("click", () => {
        close();
    });

    document.addEventListener("keydown", function (event) {
        // console.log(event);
        // if(event.code == "Tab") {
        //     event.preventDefault();
        //     event.stopPropagation();
        // }
        if(event.code == "KeyS" && event.ctrlKey == true) {
            saveLastFile();
        }
    })

    window.addEventListener('resize', () => {
        if (!window.screenTop && !window.screenY) {
            document.getElementById("smallButton2").style.display = "none";
            document.getElementById("smallButton").style.display = "block";
        } else if (window.screenWidth != screen.width) {
            document.getElementById("smallButton").style.display = "none";
            document.getElementById("smallButton2").style.display = "block";;
        }

        // s = window.getSelection();
        // oRange = s.getRangeAt(0);
        // oRect = oRange.getBoundingClientRect();

        // if (oRect.left == 0 && oRect.top == 0) {
        //     return;
        // }
        // if (oRect.height < 50) {
        //     var h = oRect.top - ((50 - oRect.height) / 2);
        // } else {
        //     var h = oRect.top + ((oRect.height - 50) / 2);
        // }

        // document.getElementById("modal").style.left = (oRect.right + 5) + "px";
        // document.getElementById("modal").style.top = h + "px";
        document.getElementById("modal").style.display = "none";
    });

    checkWords();

    // $('pre code').each(function (i, block) {
    //     hljs.highlightBlock(block);
    // });

    // hljs.configure({
    //     useBR: true
    // })
    // hljs.initHighlighting();

    // fontList.getFonts().then(fonts => {

    //     fonts.forEach(element => {
    //         console.log(element);
    //         console.log(element.replace(/"/g, ""));
    //         element.replace(/"/g, "");
    //     })

    //     systemFonts = fonts;

    //     console.warn(systemFonts.length + " fonts successfully loaded.")
    // })

}

window.onload = start;

function changeFormat(option, value) {

    //fontName      ("fontName", "Arial");
    //bold          ("bold");
    //italic        ("italic");
    //underline     ("underline");
    //list ul       ("insertUnorderedList", true);
    //list ol       ("insertOrderedList", true);
    //color         ("foreColor", "HEX");
    //bg color      ("hiliteColor", "HEX");
    //format        ("justifyCenter, justifyFull, justifyLeft, justifyRight");
    //undo          ("undo");
    //redo          ("redo");

    document.execCommand(option, false, value);
}

function insertInText(type, content) {
    s = window.getSelection();
    console.log(s);

    if(type == "img") {
        if (s.anchorNode.parentNode.id == "articleText") {
            console.log("FALSE");
            s.anchorNode.parentNode.innerHTML = `<div><img src="${content.url}"></img></div><div><br></div>`;
        } else {
            s.anchorNode.parentNode.innerHTML = `<img src="${content.url}"></img><div><br></div>`;
        }
    } else if(type == "code") {
        if (s.anchorNode.parentNode.id == "articleText") {
            console.log("FALSE");
            s.anchorNode.parentNode.innerHTML = `<div><pre><code class="${content.language}">${content.code}</code></pre></div><div><br></div>`;
        } else {
            s.anchorNode.parentNode.innerHTML = `<pre><code class="${content.language}">${content.code}</code></pre><div><br></div>`;
        }

        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    }

    checkWords();
}

function saveLastFile() {
    if(lastFile != "") {
        var data = { header: ele("articleHeader").innerHTML, author: ele("articleAuthor").innerHTML, content: ele("articleText").innerHTML };
        var content = JSON.stringify(data);
        fs.writeFile(lastFile, content, function (err) {
            if (err === null) {
                console.log("Save successful");
                lastOpened = data;
                checkWords();
            }
            else {
                console.log("Save Fail " + err);
            }
        });
    } else {
        saveFile();
    }
}

function saveFile() {
    dialog.showSaveDialog({
        filters: [{
            name: 'TextEditor File',
            extensions: ['tes']
        }
        ]
    },
        (fileName) => {
            var data = { header: ele("articleHeader").innerHTML, author: ele("articleAuthor").innerHTML, content: ele("articleText").innerHTML };
            var name = fileName.split("\\");
            name = name[name.length - 1];
            var content = JSON.stringify(data);
            if (fileName === undefined) return;
            fs.writeFile(fileName, content, function (err) {
                if (err === null) {
                    ele("articleShort").innerHTML = name;
                    console.log("Save successful");
                    lastOpened = data;
                    lastFile = fileName;
                    checkWords();
                }
                else {
                    console.log("Save Fail " + err);
                }
            });
        });
}

function openFile() {
    dialog.showOpenDialog({
        filters: [{
            name: 'TextEditor File',
            extensions: ['tes']
        }
        ]
    },
        (fileNames) => {
            var name = fileNames[0].split("\\");
            name = name[name.length - 1];
            console.log(name);
            console.log(fileNames[0])
            if (fileNames === undefined) return;
            var fileName = fileNames[0];
            for (var i = 0; i < fileName.length; i++) { fileName = fileName.replace(`\\`, "/") }
            fs.readFile(fileName, 'utf-8', function (err, data) {
                if (err === null) {
                    openFileFlow(JSON.parse(data), name);
                    lastFile = fileName;
                }
                else {
                    console.log("Open Fail");
                }
            });
        }); 
}

function ele(id) {
    return document.getElementById(id);
}

function openFileFlow(data, name) {
    lastOpened = data;
    console.log(data);
    ele("articleShort").innerHTML = name;
    ele("articleHeader").innerHTML = data.header;
    ele("articleAuthor").innerHTML = data.author;
    ele("articleText").innerHTML = data.content;
    checkWords();
}

window.oncontextmenu = function (event) {
    if (event.path.includes(document.getElementById("articleText"))) {
        customModal();
        closeModal();
        return false;
    }
}

function customModal() {
    s = window.getSelection();
    oRange = s.getRangeAt(0);
    oRect = oRange.getBoundingClientRect();

    if(oRect.left == 0 && oRect.top == 0) {
        return;
    }
    if(oRect.height < 50) {
        var h = oRect.top - ((50 - oRect.height) / 2);
    } else {
        var h = oRect.top + ((oRect.height - 50) / 2);
    }

    document.getElementById("modal").style.left = (oRect.right + 5) + "px";
    document.getElementById("modal").style.top = h + "px";
    document.getElementById("modal").style.display = "block";

    if (window.getSelection().focusNode.parentElement.nodeName == "FONT") {
        console.log("Font:", window.getSelection().focusNode.parentElement.face);
    } else if (window.getSelection().focusNode.parentElement.nodeName == "DIV") {
        console.log("Font: Adamina");
    }

    // console.log(window.getSelection().focusNode.parentElement.nodeName);
}

var timerClose;

function openModal() {
    clearTimeout(timerClose);
    document.getElementById("modal").style.opacity = '1';
}

function closeModal() {
    setTimeout(() => {
        document.getElementById("modal").style.opacity = '0.8';
    }, 200);
    timerClose = setTimeout(() => {
        document.getElementById("modal").style.opacity = '0';
        setTimeout(() => {
            document.getElementById("modal").style.display = "none";
            document.getElementById("modal").style.opacity = '0.8';

            //TODO:
        }, 200);
    }, 2000);
}

var timer;

document.addEventListener("selectionchange", function () {
    if(window.getSelection().isCollapsed == true) {
        document.getElementById("modal").style.opacity = '0';
        setTimeout(() => {
            document.getElementById("modal").style.display = "none";
            document.getElementById("modal").style.opacity = '0.8';

            //TODO:
        }, 200);
        clearTimeout(timer);
        return;
    } else {
        document.getElementById("modal").style.opacity = '0';
        setTimeout(() => {
            document.getElementById("modal").style.display = "none";
            document.getElementById("modal").style.opacity = '0.8';

            //TODO:
        }, 200);
        clearTimeout(timer);
        // timer = setTimeout(() => {
        //     customModal();
        //     console.log("TIMER");
        // }, 500);
    }
})

function minimize() {
    console.log("minimize");
    ipcRenderer.send('minimize');
}
function maximize() {
    console.log("maximize");
    ipcRenderer.send('maximize');
}
function unMaximize() {
    console.log("unMaximize");
    ipcRenderer.send('unMaximize');
}
function close() {
    console.log("close");
    ipcRenderer.send('close');
}