var socket = io.connect();
var BoxOpened = "";
var ImgOpened = "";
var Counter = 0;
var ImgFound = 0;
var isGameActive = false; 
var socket;
var currentPlayer = 1; 

var Source = "#boxcard";

var ImgSource = [
"/resimler/dinazor.png",
"/resimler/maymun2.png",
"/resimler/at.png",
"/resimler/bukalemun.png",
"/resimler/çita.png",
"/resimler/kaplumbağa.png",
"/resimler/kedi.png",
"/resimler/aslan1905.png",
"/resimler/tilki.png",
"/resimler/kuzu.png"

];
function startGameCountdown() {
  document.getElementById('yazii').style.display='none';
  document.getElementById('gameScreen').style.display='block';
}
function startSinglePlayer() {
    isGameActive=true;
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
  if (socket) {
    socket.disconnect();
}
}

function startMultiPlayer() {
    isGameActive=true;
    document.getElementById('startScreen').style.display = 'none';
      document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('yazii').innerHTML = "1. oyuncu hazır, 2. oyuncu bekleniyor.";
    var roomName = prompt("Lütfen bir oda adı girin:");
    socket.emit('joinRoom', roomName);
    socket = io.connect();
    socket.emit('playerTurn', currentPlayer);
}
function startGame(roomName) {
    document.getElementById('yazii').innerHTML = "Oda: " + roomName + "<br>1. oyuncu hazır, 2. oyuncu hazır.<br>Oyun başlatılıyor...";
    setTimeout(startGameCountdown, 3500);
  }
  
  socket.on('startGame', startGame);

  socket.on('playerTurn', function(player) {
    currentPlayer = player;
    if (currentPlayer === 2) {
      $(Source + " div").bind("click", OpenCard);
    }
  });

  function playerReady(playerNumber) {
    socket.emit('playerReady', playerNumber);
  }


function RandomFunction(MaxValue, MinValue) {
return Math.round(Math.random() * (MaxValue - MinValue) + MinValue);
}

function ShuffleImages() {
var ImgAll = $(Source).children();
var ImgThis = $(Source + " div:first-child");
var ImgArr = new Array();

for (var i = 0; i < ImgAll.length; i++) {
ImgArr[i] = $("#" + ImgThis.attr("id") + " img").attr("src");
ImgThis = ImgThis.next();
}

ImgThis = $(Source + " div:first-child");

for (var z = 0; z < ImgAll.length; z++) {
var RandomNumber = RandomFunction(0, ImgArr.length - 1);
$("#" + ImgThis.attr("id") + " img").attr("src", ImgArr[RandomNumber]);
ImgArr.splice(RandomNumber, 1);
ImgThis = ImgThis.next();
}
}

function ResetGame() {
    if (!isGameActive) return;
ShuffleImages();
$(Source + " div img").hide();
$(Source + " div").css("visibility", "visible");
Counter = 0;
$("#counter").html("" + Counter);
BoxOpened = "";
ImgOpened = "";
ImgFound = 0;
return false;
}
ClickedCards = []; // Tıklanan kartları sıfırla

function CheckMatch(id) {
    if (ImgOpened != "") {
      var currentImg = $("#" + id + " img").attr("src");
      
      if (ImgOpened != currentImg) {
        setTimeout(function () {
          $("#" + id + " img").slideUp("fast");
          $("#" + BoxOpened + " img").slideUp("fast");
          BoxOpened = "";
          ImgOpened = "";
        }, 400);
      } else {
        $("#" + id + " img")
          .parent()
          .css("visibility", "hidden");
        $("#" + BoxOpened + " img")
          .parent()
          .css("visibility", "hidden");
        ImgFound++;
        BoxOpened = "";
        ImgOpened = "";
      }
  
      setTimeout(function () {
        $(Source + " div").bind("click", OpenCard);
      }, 400);
    }
  
    ClickedCards.push(id);
  
    if (ClickedCards.length === 2) {
      Counter++;
      $("#Counter").html("" + Counter);
  
    }
  }

  function OpenCard() {
    if (!isGameActive) return;
    
    var id = $(this).attr("id");
  
    if ($("#" + id + " img").is(":hidden")) {
      $(Source + " div").unbind("click", OpenCard);
  
      $("#" + id + " img").slideDown("fast");
  
      if (ImgOpened == "") {
        BoxOpened = id;
        ImgOpened = $("#" + id + " img").attr("src");
  
        // Kart açma isteğini sunucuya gönder
        socket.emit('openCard', { id: id, img: ImgOpened, playerSocketId: socket.id, isOpen: true });
  
        setTimeout(function () {
          $(Source + " div").bind("click", OpenCard);
        }, 300);
      } else {
        CheckMatch(id);
      }
    }
    
    Counter++;
    $("#Counter").html("" + Counter);
  
    if (ImgFound == ImgSource.length) {
      $("#Counter").prepend('<span id="success">Tebrikler! </span>');
    }
}


$(function () {
  for (var y = 0; y < 2; y++) {
      $.each(ImgSource, function (i, val) {
          $(Source).append(
              "<div id=card" + y + i + "><img src=" + val + " />"
          );
      });
  }

  $(Source + " div").click(OpenCard);
  ShuffleImages();

  // Socket.io dinleyicisi
  socket.on('cardOpened', (data) => {
      var id = data.id;
      var img = data.img;

      $("#" + id + " img").attr("src", img);
      $("#" + id + " img").slideDown("fast");

      if (ImgOpened != "") {
          CheckMatch(id);
      }
  });
});
