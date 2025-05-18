document.addEventListener('DOMContentLoaded', async () => {
    const db           = firebase.firestore();
    const form         = document.getElementById('qForm');
    const subjSel      = document.getElementById('subjectSelect');
    const subSel       = document.getElementById('subSelect');
    const qTextInput   = document.getElementById('qText');
    const qImgInput    = document.getElementById('qImg');
    const optsWrapper  = document.getElementById('optsWrapper');
    const grid         = document.getElementById('questionsGrid');
    const heading      = document.getElementById('formHeading');
  
    let editId = null;  // if set, we’re editing that doc
  
    // 1) Populate subjectSelect from Firestore
    const subjectsSnap = await db.collection('subjects').get();
    const subjects = subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      subjSel.appendChild(opt);
    });
  
    // 2) When subject changes, populate subSel
    subjSel.onchange = () => {
      subSel.innerHTML = '';
      const found = subjects.find(s=>s.name===subjSel.value);
      (found?.subs||[]).forEach(sub=>{
        const o = document.createElement('option');
        o.value = sub; o.textContent = sub;
        subSel.appendChild(o);
      });
    };
    // trigger once
    subjSel.onchange();
  
    // 3) Build 4 option rows
    function buildOptionRows(vals = ['', '', '', ''], correctIndex = 0) {
      optsWrapper.innerHTML = '';
      for(let i=0;i<4;i++){
        const row = document.createElement('div');
        row.className = 'opt-row';
        row.innerHTML = `
          <input type="text" class="optText" placeholder="Option ${i+1}" value="${vals[i]}" required/>
          <label>
            <input type="radio" name="correctOpt" value="${i}" ${i===correctIndex?'checked':''}/> Correct
          </label>`;
        optsWrapper.appendChild(row);
      }
    }
    buildOptionRows();
  
    // 4) List existing questions
    async function loadQuestions() {
      grid.innerHTML = '';
      const snap = await db.collection('questions').orderBy('createdAt','desc').get();
      snap.forEach(doc => {
        const q = doc.data();
        const card = document.createElement('div');
        card.className = 'course-card';
        // summary view
        card.innerHTML = `
          <div class="course-content">
            <h3>[${q.subject} › ${q.sub}] ${q.text.slice(0,40)}…</h3>
            <small>Correct: ${q.options[q.correct]}</small>
          </div>`;
        // Edit button
        const edit = document.createElement('button');
        edit.className='btn-small btn-outline';
        edit.textContent='Edit';
        edit.onclick = () => startEdit(doc.id, q);
        // Delete button
        const del = document.createElement('button');
        del.className='btn-small btn-outline';
        del.textContent='Delete';
        del.onclick = async () => {
          if(!confirm('Delete this question?')) return;
          await db.collection('questions').doc(doc.id).delete();
          loadQuestions();
        };
        card.appendChild(edit);
        card.appendChild(del);
        grid.appendChild(card);
      });
    }
  
    // 5) Fill form for editing
    function startEdit(id, q) {
      editId = id;
      heading.textContent = 'Edit Question';
      subjSel.value = q.subject;
      subjSel.onchange();         // refresh subSel
      subSel.value = q.sub;
      qTextInput.value  = q.text;
      qImgInput.value   = q.imgURL||'';
      buildOptionRows(q.options, q.correct);
      window.scrollTo(0,0);
    }
  
    // 6) Handle form submit (add or update)
    form.onsubmit = async e => {
      e.preventDefault();
      const payload = {
        subject: subjSel.value,
        sub:     subSel.value,
        text:    qTextInput.value.trim(),
        imgURL:  qImgInput.value.trim(),
        options: Array.from(document.querySelectorAll('.optText')).map(i=>i.value.trim()),
        correct: Number(document.querySelector('input[name=correctOpt]:checked').value),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if(editId){
        await db.collection('questions').doc(editId).update(payload);
        alert('Question updated');
      } else {
        await db.collection('questions').add(payload);
        alert('Question added');
      }
      // reset
      editId = null;
      heading.textContent = 'Add New Question';
      form.reset();
      buildOptionRows();
      loadQuestions();
    };
  
    loadQuestions();
  });
  