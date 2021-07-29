let googleUserID;
let noteData;
let sortedLabels;

window.onload = event => {
  // Firebase authentication goes here.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Logged in as: " + user.displayName);
      googleUserID = user.uid;
      getNotes();
    } else {
      window.location = "index.html"; // If not logged in, navigate back to login page.
    }
  });
};

const getNotes = userId => {
    const notesRef = firebase.database().ref(`users/${googleUserID}`);
  notesRef.on("value", snapshot => {
    const data = snapshot.val();
    noteData = data;
    renderDataAsHtml(data); 
  });
};

//Given a list of notes, renders them in HTML.
const renderDataAsHtml = data => {
  let cards = "";
  var anyRecycling = false;
  for (const noteItem in data) {
    console.log(data[noteItem].isRecycled);
    if (data[noteItem].isRecycled) {
      const note = data[noteItem];
      cards += createCard(note, noteItem);
      anyRecycling = true;
    }
  }
  if(!anyRecycling){
    document.querySelector("#responsiveText").innerHTML = "There are no recycled notes to display.";
  }
  document.querySelector("#app").innerHTML = cards;
};

// Returns a note object converted into an HTML card.
const createCard = (note, noteId) => {
  const card = `<div class="card">
  <header class="card-header">
    <p class="card-header-title">
      ${note.title}
    </p>
  </header>
  <div class="card-content">
<p class="subtitle is-6">Category: ${note.labels.join(
                          ", "
                        )}</p>

    <div class="content">
      note.text
      <br>
    </div>
  </div>
  <footer class="card-footer">
    <a id="${noteId}" href="#" class="card-footer-item"
                 onclick="deleteNote('${noteId}')">
                 Delete
              </a>
              <a id="${noteId}" href="#" class="card-footer-item"
                 onclick="unrecycleNote('${noteId}')">
                 Un-recycle
              </a>
  </footer>
</div>`;

  return card;
};


//Delete note.
function deleteNote(noteId) {
  firebase
    .database()
    .ref(`users/${googleUserID}/${noteId}`)
    .remove();
}

//Un-recycle note.
function unrecycleNote(noteId) {
  const recycleUpdate = {};
  recycleUpdate['/users/' + googleUserID + '/' + noteId + "/isRecycled"] = false;
  recycleUpdate['/users/' + googleUserID + '/' + noteId + "/isArchived"] = false;
  firebase.database().ref().update(recycleUpdate);
}

//                <hr class="solid"></hr>
//                      <p>${Date.parse(note.timestamp)}</p>

// delete button that works as adding a tag archived 
// with tag archived, the note is not actually deleted, and we can have a recycling bin to see all the "deleted notes"

// have delete button actually delete ?
// have archive button, and then place to see all archived ()

// delete button -> recycling bin -> actual delete/actual gone
// archive button -> only archived notes -> delete -> recycling bin -> actual delete