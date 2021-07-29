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

//Places the note cards.
const getNotes = userId => {
  const allTheLabels = [];
  const notesRef = firebase.database().ref(`users/${googleUserID}`);
  notesRef.on("value", snapshot => {
    const data = snapshot.val();
    noteData = data;
    renderDataAsHtml(data);
    for (const noteItem in data) {
      for (let i = 0; i < data[noteItem].labels.length; i++) {
        if (!data[noteItem].isArchived && !data[noteItem].isRecycled) {
          allTheLabels.push(data[noteItem].labels[i]);
        }
      }
    }
    sortedLabels = [...new Set(allTheLabels)];
    getLabelButtons();
  });
};

//Given a list of notes, renders them in HTML.
const renderDataAsHtml = data => {
  let cards = "";
  for (const noteItem in data) {
    if (!data[noteItem].isArchived && !data[noteItem].isRecycled) {
      const note = data[noteItem];
      cards += createCard(note, noteItem);
    }
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
      ${note.text}
      <br>
    </div>
  </div>
  <footer class="card-footer">
    <a id="${noteId}" href="#" class="card-footer-item"
                 onclick="recycleNote('${noteId}')">
                 Delete
              </a>
              <a id="${noteId}" href="#" class="card-footer-item"
                 onclick="archiveNote('${noteId}')">
                 Archive
              </a>
  </footer>
</div>`;
  return card;
};

//Places the label buttons above the cards.
function getLabelButtons() {
  let labels =
    `<button class="all button is-link has-text-weight-medium is-medium"  onclick="showAll()">ALL</button>    <button class="all button is-link has-text-weight-medium is-medium"  onclick="window.location.href='recyclingBin.html'">RECYCLING BIN</button> <button class="all button is-link has-text-weight-medium is-medium"  onclick="viewArchived()">ARCHIVED</button>`;
  console.log(sortedLabels);
  for (var i = 0; i < sortedLabels.length; i++) {
    console.log(sortedLabels[i]);
    labels += createLabelButton(sortedLabels[i]);
  }
  document.querySelector("#labelsBox").innerHTML = labels;
}

// Sorts the notes by label.
function filterByLabel(labelName) {
  console.log("filtering" + labelName);
  let notesOfCertainLabel = [];
  for (const noteItem in noteData) {
    const note = noteData[noteItem];
    if (!note.isArchived) {
      if (note.labels.includes(labelName)) {
        notesOfCertainLabel.push(note);
      }
    }
  }
  renderDataAsHtml(notesOfCertainLabel);
}

//Creates label buttons.
function createLabelButton(labelName) {
  console.log("Generating label for " + labelName);
  const label = `
                  <button class="button is-link has-text-weight-medium is-medium"  onclick="filterByLabel('${labelName}')">${labelName}</button>`;
  return label;
}
//Shows all notes.
function showAll() {
  renderDataAsHtml(noteData);
}

//Archive note.
function archiveNote(noteId) {
  const archiveUpdate = {};
  archiveUpdate['/users/' + googleUserID + '/' + noteId + "/isArchived"] = true;
  firebase.database().ref().update(archiveUpdate);
}

//unarchive note.
function unarchiveNote(noteId) {
  const archiveUpdate = {};
  archiveUpdate['/users/' + googleUserID + '/' + noteId + "/isArchived"] = false;
  firebase.database().ref().update(archiveUpdate);
}

//Recycle note.
function recycleNote(noteId) {
  const recycleUpdate = {};
  recycleUpdate['/users/' + googleUserID + '/' + noteId + "/isRecycled"] = true;
  firebase.database().ref().update(recycleUpdate);
}

//View archived notes.
function viewArchived(){
  let cards = "";
  for (const noteItem in noteData) {
    console.log(noteData[noteItem].isArchived)
    if (noteData[noteItem].isArchived) {
      const note = noteData[noteItem];
      cards += createCard(note, noteItem);
    }
  }
  document.querySelector("#app").innerHTML = cards;
}

/*

*/

//                <hr class="solid"></hr>
//                      <p>${Date.parse(note.timestamp)}</p>

// delete button that works as adding a tag archived 
// with tag archived, the note is not actually deleted, and we can have a recycling bin to see all the "deleted notes"

// have delete button actually delete ?
// have archive button, and then place to see all archived ()

// delete button -> recycling bin -> actual delete/actual gone
// archive button -> only archived notes -> delete -> recycling bin -> actual delete