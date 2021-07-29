let googleUser;

// let firebase = firebase;

window.onload = event => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Logged in as: " + user.displayName);
      googleUser = user;
    } else {
      window.location = "index.html"; // If not logged in, navigate back to login page.
    }
  });
};

const handleNoteSubmit = () => {
  // 1. Capture the form data
  const noteTitle = document.querySelector("#noteTitle");
  const noteText = document.querySelector("#noteText");

  const timestampText = new Date().getTime();

  const labelText = document.querySelector("#noteLabels");

  const labelsArray = labelText.value.split(",");
  for (var i = 0; i < labelsArray.length; i++) {
    labelsArray[i] = labelsArray[i].toLowerCase();
    labelsArray[i] = labelsArray[i].trim();
  }

  let sortedLabelsArray = [...new Set(labelsArray)];

  console.log(`Timestamp: ${timestampText}`);
  // 2. Format the data and write it to our database
  firebase
    .database()
    .ref(`users/${googleUser.uid}`)
    .push({
      title: noteTitle.value,
      text: noteText.value,
      timestamp: timestampText,
      labels: sortedLabelsArray,
      isArchived: false, 
      isRecycled: false
    })
    // 3. Clear the form so that we can write a new note
    .then(() => {
      noteTitle.value = "";
      noteText.value = "";
      labelText.value = "";
    });
};

function logout() {
  firebase
    .auth()
    .signOut()
    .then(
      function() {
        alert("Sign out successful.");
      },
      function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        const err = {
          errorCode,
          errorMessage,
          email,
          credential
        };
        console.log(err);
      }
    );
}
