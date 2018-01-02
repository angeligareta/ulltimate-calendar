/* JAVASCRIPT */
function getLoginForm() {
  var form = '<form id="login-form" method="post">'
              + '<input class="form-input" type="text" name="name" placeholder="Nombre" required/>'
              + '<input class="form-input" type="email" name="email" placeholder="Email" required/>'
              + '<input class="form-input" type="password" name="password" placeholder="Contraseña" required/>'
            + '</form>';
  return form;
}

function getGlobalChat() {
  var form = '<div id="message-center"> </div>'
              + '<form id="global-chat">'
              + '<input class="form-input" type="text" name="message" placeholder="Mensaje" required/>'
              + '<input id="send-message" class="form-input" type="button" value="Enviar" required/>'
            + '</form>';
  return form;
}

function sendMessage() {
  var chat_message = globalChat["message"].value;
  firebase.database().ref('global-chat').push({
    name: userName,
    message: chat_message
  });
}

// Se  crea la ventana de chat
alertify.dialog('chat',function factory(){
  return{
    main:function(message) {
      this.message = message;
    },
    build:function() {
      var chatHeader = 'Contacto';
      this.setHeader(chatHeader);
    },
    setup:function( ){
      return {
        // buttons:[{text: "Entrar", key:13, className: "btn btn-primary login-button"}],
        buttons:[ {text: "Salir", className: "btn btn-primary exit-button invisible"},
        {text: "Registrarse", className: "btn btn-primary register-button"},
        {text: "Entrar", className: "btn btn-primary login-button"}],
        focus: { element:0 }
      };
    },
    callback:function(closeEvent){ // Lo llama cuando se le da a cerrar
      closeEvent.cancel = true;

      switch (closeEvent.index) {
        case 0: // Register Button
        closeEvent.cancel = false;
        firebase.auth().signOut();
        break;
        case 1: // Register Button
        registerUser();
        break;
        case 2: // Login Button
        loginUser();
        break;
      }
    },
    options: {
      resizable: true
    },
    prepare:function(){
      this.setContent(this.message);
    }
  }});

  // FIREBASE
  var config = {
    apiKey: "AIzaSyAQVsP4VGYdPrS89DR0Rj8rpmJePYx5L50",
    authDomain: "practicafirebase-40109.firebaseapp.com",
    databaseURL: "https://practicafirebase-40109.firebaseio.com",
    projectId: "practicafirebase-40109",
    storageBucket: "practicafirebase-40109.appspot.com",
    messagingSenderId: "240285064902"
  };

  firebase.initializeApp(config);

/* Listen to Contact Tab. */
contactTab = document.getElementById("contact-tab");
contactTab.addEventListener("click", function(e) {
  e.preventDefault;

  void contactTab.offsetWidth; // -> triggering reflow /* The actual magic */ without this it wouldn't work.
  contactTab.classList.add("active");

  var form = getLoginForm();
  chat = alertify.chat(form).resizeTo('25%', 375);

  loginForm = document.getElementById("login-form");

  // Los declaro global para usarlos luego a la hora de ocultarlos
  loginButton = document.getElementsByClassName("login-button")[0];
  registerButton = document.getElementsByClassName("register-button")[0];
  exitButton = document.getElementsByClassName("exit-button")[0];
}, false);

function registerUser() {
  userName = loginForm["name"].value;
  var userEmail = loginForm["email"].value;
  var userPassword = loginForm["password"].value;

  // Auth the user
  const auth = firebase.auth();
  const promise = auth.createUserWithEmailAndPassword(userEmail, userPassword);

  // https://firebase.google.com/docs/reference/js/firebase.auth.Auth#createUserWithEmailAndPassword
  promise.catch(function(e) {
    switch (e.code) {
      case 'auth/email-already-in-use':
        alertify.message("¡Este usuario ya está registrado!");
        break;
      case 'auth/invalid-email':
        alertify.message("Introduce un email válido.");
        break;
      case 'auth/operation-not-allowed':
        alertify.message("UPS... ¡La operación no está permitida!");
        break;
      case 'auth/weak-password':
        alertify.message("La contraseña no es segura.");
        break;
      default: break;
    }
  });
}

function loginUser() {
  userName = loginForm["name"].value;
  var userEmail = loginForm["email"].value;
  var userPassword = loginForm["password"].value;

  // Auth the user
  const auth = firebase.auth();
  const promise = auth.signInWithEmailAndPassword(userEmail, userPassword);

  // https://firebase.google.com/docs/reference/js/firebase.auth.Auth#createUserWithEmailAndPassword
  promise.catch(function(e) {
    switch (e.code) {
      case 'auth/invalid-email':
        alertify.message("Introduce un email válido.");
        break;
      case 'auth/user-disabled':
        alertify.message("El usuario ha sido desactivado.");
        break;
      case 'auth/user-not-found':
        alertify.message("El usuario no está registrado.");
      break;
      case 'auth/wrong-password':
        alertify.message("La contraseña no es correcta.");
        break;
      default: break;
    }
  });
}

// Función que se llama cuando un usuario incia sesión o sale
firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    console.log(firebaseUser);
    exitButton.classList.remove('invisible');
    loginButton.classList.add('invisible');
    registerButton.classList.add('invisible');

    chat.setContent(getGlobalChat());
    chat.maximize();

    globalChat = document.getElementById("global-chat");
    sendMessageButton = document.getElementById("send-message");
    messageCenter = document.getElementById("message-center");

    sendMessageButton.addEventListener("click", sendMessage);
  }
  else {
    console.log('not logged in');
    exitButton.classList.add('invisible');
    loginButton.classList.remove('invisible');
    registerButton.classList.remove('invisible');
  }
});

// Cargar en global-chat todos los cambios de la base de datos Firebase
firebase.database().ref('global-chat')
.on('value', function(snapshot) {
    var html = '';
    snapshot.forEach(function (e) {
      var message = e.val();
      var user_name = message.name;
      var user_message = message.message;
      html += "<p>" + user_name + " escribió: " + user_message + "</p>";
    });
    messageCenter.innerHTML = html;
});
