let googleUserID;
let noteData;
let sortedLabels;
let inArchive = false;

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
                 onclick="editNote('${noteId}')">
                 Edit
              </a>
    <a id="${noteId}" href="#" class="card-footer-item"
                 onclick="recycleNote('${noteId}')">
                 Delete
              </a>
              <a id="${noteId}" href="#" class="card-footer-item"
                 onclick="archiveNote('${noteId}')">
                 ${note.isArchived ? "Un-archive" : "Archive"}
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
  inArchive = false;
}

//Archive note.
function archiveNote(noteId) {
  const archiveUpdate = {};
  console.log(`noteId.isarchived = ${noteData[noteId].isArchived}`)
  archiveUpdate['/users/' + googleUserID + '/' + noteId + "/isArchived"] = !noteData[noteId].isArchived;
  console.log(`noteId.isarchived = ${noteData[noteId].isArchived}`)
  firebase.database().ref().update(archiveUpdate);
  inArchive ? viewArchived() : showAll();
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
  inArchive = true;
  document.querySelector("#app").innerHTML = cards;
}

//Open the edit modal note.
const editNote = (noteId) => {
  const editNoteModal = document.querySelector('#editNoteModal');
    const noteDetails = noteData[noteId];
    document.querySelector('#editTitleInput').value = noteDetails.title;
    document.querySelector('#editTextInput').value = noteDetails.text;
  editNoteModal.classList.toggle('is-active');
  const saveEditBtn = document.querySelector('#saveEdit');
  saveEditBtn.onclick = handleSaveEdit.bind(this, noteId);
};

//Save the edit to Firebase.
function handleSaveEdit(noteId){
    const title = document.querySelector('#editTitleInput').value;
    const text = document.querySelector('#editTextInput').value;
    const editUpdate = {};
    editUpdate['/users/' + googleUserID + '/' + noteId + "/title"] = title;
    editUpdate['/users/' + googleUserID + '/' + noteId + "/text"] = text;
    firebase.database().ref().update(editUpdate);
}

//Close the edit modal.
const closeEditModal = () => {
  const editNoteModal = document.querySelector('#editNoteModal');
  editNoteModal.classList.toggle('is-active');
};