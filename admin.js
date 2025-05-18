document.addEventListener('DOMContentLoaded', () => {
    const form      = document.getElementById('subjectForm');
    const nameInput = document.getElementById('subjectName');
    const subInputs = document.getElementById('subInputs');
    const addBtn    = document.getElementById('addSubBtn');
    const grid      = document.getElementById('subjectsGrid');
  
    // 1) Add another input for sub-topics
    addBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.className   = 'subInput';
      inp.placeholder = 'Sub-topic';
      inp.required    = true;
      subInputs.appendChild(inp);
    });
  
    // 2) Create subject in Firestore
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const subs = Array.from(subInputs.children)
                        .map(i => i.value.trim())
                        .filter(v => v);
      if (!name || subs.length === 0) {
        return alert('Please provide a subject name and at least one sub-topic.');
      }
      try {
        await db.collection('subjects').add({
          name,
          subs,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('Subject created!');
        form.reset();
        subInputs.innerHTML = '<input class="subInput" placeholder="Sub-topic" required/>';
        loadSubjects();
      } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
      }
    });
  
    // 3) Fetch & render subjects, now with Delete
    async function loadSubjects() {
      grid.innerHTML = '';
      try {
        const snapshot = await db
          .collection('subjects')
          .orderBy('createdAt', 'desc')
          .get();
  
        snapshot.forEach(doc => {
          const { name, subs } = doc.data();
          const id = doc.id;
  
          // build card
          const card = document.createElement('div');
          card.className = 'course-card';
          const content = document.createElement('div');
          content.className = 'course-content';
          content.innerHTML = `
            <h3>${name}</h3>
            <p>${subs.length} sub-topic(s)</p>
          `;
  
          // EDIT button (if you still want it)
          const editBtn = document.createElement('button');
          editBtn.className = 'btn-small btn-outline';
          editBtn.textContent = 'Edit';
          // TODO: wire up your edit logic
          content.appendChild(editBtn);
          // inside your loadSubjects() snapshot.forEach loop, replace editBtn's click handler with:
        editBtn.addEventListener('click', async () => {
            // 1) Ask for new subject name
            const newName = prompt("Edit subject name:", name);
            if (newName === null) return;               // user cancelled
            const trimmedName = newName.trim();
            if (!trimmedName) {
            return alert("Name cannot be empty.");
            }
        
            // 2) Ask for new sub-topics as comma-separated list
            const raw = prompt(
            "Enter sub-topics, separated by commas:",
            subs.join(", ")
            );
            if (raw === null) return;                   // user cancelled
            const newSubs = raw
            .split(",")
            .map(s => s.trim())
            .filter(s => s);
            if (newSubs.length === 0) {
            return alert("Please provide at least one sub-topic.");
            }
        
            // 3) Write update back to Firestore
            try {
            await db.collection('subjects').doc(id).update({
                name: trimmedName,
                subs: newSubs
            });
            alert("Subject updated!");
            loadSubjects();   // refresh the grid
            } catch (err) {
            console.error(err);
            alert("Update failed: " + err.message);
            }
        });
  
  
          // DELETE button
          const delBtn = document.createElement('button');
          delBtn.className = 'btn-small btn-outline';
          delBtn.textContent = 'Delete';
          delBtn.style.marginLeft = '0.5rem';
          delBtn.addEventListener('click', async () => {
            if (!confirm(`Delete subject “${name}”? This cannot be undone.`)) return;
            try {
              await db.collection('subjects').doc(id).delete();
              alert('Subject deleted.');
              loadSubjects();
            } catch (err) {
              console.error(err);
              alert('Delete failed: ' + err.message);
            }
          });
          content.appendChild(delBtn);
  
          // stripe image
          const img = document.createElement('div');
          img.className = 'course-img';
  
          card.appendChild(img);
          card.appendChild(content);
          grid.appendChild(card);
        });
      } catch (err) {
        console.error(err);
        grid.textContent = 'Failed to load subjects.';
      }
    }
  
    // initial load
    loadSubjects();
  });
  