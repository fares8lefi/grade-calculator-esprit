// State
let grades = JSON.parse(localStorage.getItem('gradeData')) || [];

// DOM Elements
const form = document.getElementById('gradeForm');
const gradesTableBody = document.querySelector('#gradesTable tbody');
const emptyState = document.getElementById('emptyState');
const generalAverageEl = document.getElementById('generalAverage');
const validatedCountEl = document.getElementById('validatedCount');
const dangerCountEl = document.getElementById('dangerCount');
const resetBtn = document.getElementById('resetBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const printBtn = document.getElementById('printBtn');

// Formulas
function calculerMoyenne(notes) {
    const { cc, tp, exam } = notes;
    const hasCC = cc !== null && cc !== undefined && !isNaN(cc) && cc !== '';
    const hasTP = tp !== null && tp !== undefined && !isNaN(tp) && tp !== '';
    
    const valCC = hasCC ? parseFloat(cc) : 0;
    const valTP = hasTP ? parseFloat(tp) : 0;
    const valExam = parseFloat(exam);

    // 3 notes: note1 * 0.2 + note2 * 0.3 + note_exam * 0.5
    if (hasCC && hasTP) {
        return (valCC * 0.3 + valTP * 0.2 + valExam * 0.5).toFixed(2);
    }
    
    // 2 notes: note1 * 0.4 + note_exam * 0.6
    // We treat the existing one as note1
    if (hasCC || hasTP) {
        const note1 = hasCC ? valCC : valTP;
        return (note1 * 0.4 + valExam * 0.6).toFixed(2);
    }

    // 1 note: retourne la note d'examen
    return valExam.toFixed(2);
}

function getStyleMoyenne(moyenne) {
    const moy = parseFloat(moyenne);
    if (moy >= 16) return { class: 'grade-excellent', icon: '🟢' };
    if (moy >= 10) return { class: 'grade-good', icon: '🟡' };
    if (moy >= 8) return { class: 'grade-warning', icon: '🔴' };
    return { class: 'grade-danger', icon: '🔴⚠️' };
}

// Render Functions
function renderTable() {
    gradesTableBody.innerHTML = '';
    
    if (grades.length === 0) {
        emptyState.style.display = 'block';
        updateStats();
        return;
    }
    
    emptyState.style.display = 'none';

    grades.forEach((grade, index) => {
        const avg = calculerMoyenne({ cc: grade.cc, tp: grade.tp, exam: grade.exam });
        const style = getStyleMoyenne(avg);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${grade.subject}</td>
            <td>${grade.cc !== '' ? grade.cc : '-'}</td>
            <td>${grade.tp !== '' ? grade.tp : '-'}</td>
            <td>${grade.exam}</td>
            <td>${grade.coef}</td>
            <td><span class="grade-badge ${style.class}">${avg} ${style.icon}</span></td>
            <td>
                <button class="btn-delete" onclick="deleteGrade(${index})" title="Supprimer">✖</button>
            </td>
        `;
        gradesTableBody.appendChild(tr);
    });

    updateStats();
    saveData();
}

function updateStats() {
    if (grades.length === 0) {
        generalAverageEl.textContent = '-';
        validatedCountEl.textContent = '-';
        dangerCountEl.textContent = '-';
        return;
    }

    let totalPoints = 0;
    let totalCoef = 0;
    let validated = 0;
    let danger = 0;

    grades.forEach(grade => {
        const avg = parseFloat(calculerMoyenne({ cc: grade.cc, tp: grade.tp, exam: grade.exam }));
        const coef = parseFloat(grade.coef);
        
        totalPoints += avg * coef;
        totalCoef += coef;

        if (avg >= 10) validated++;
        if (avg < 8) danger++;
    });

    const generalAvg = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : '0.00';
    
    generalAverageEl.textContent = generalAvg;
    validatedCountEl.textContent = validated;
    dangerCountEl.textContent = danger;
    
    // Style general average
    const style = getStyleMoyenne(generalAvg);
    generalAverageEl.style.color = style.class === 'grade-excellent' ? '#d4edda' : 'white';
}

// Data Management
function saveData() {
    localStorage.setItem('gradeData', JSON.stringify(grades));
}

function addGrade(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const coef = document.getElementById('coef').value;
    const cc = document.getElementById('noteCC').value;
    const tp = document.getElementById('noteTP').value;
    const exam = document.getElementById('noteExam').value;

    const newGrade = {
        subject,
        coef,
        cc,
        tp,
        exam
    };

    grades.push(newGrade);
    renderTable();
    form.reset();
    document.getElementById('subject').focus();
}

// Global scope for delete function (called from HTML)
window.deleteGrade = function(index) {
    if(confirm('Voulez-vous vraiment supprimer cette matière ?')) {
        grades.splice(index, 1);
        renderTable();
    }
};

// Event Listeners
form.addEventListener('submit', addGrade);

resetBtn.addEventListener('click', () => {
    if(confirm('Tout effacer ?')) {
        grades = [];
        renderTable();
    }
});

printBtn.addEventListener('click', () => {
    window.print();
});

exportCsvBtn.addEventListener('click', () => {
    if(grades.length === 0) return alert('Aucune donnée à exporter.');
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Matière,Note CC,Note TP,Note Exam,Coef,Moyenne\n";
    
    grades.forEach(grade => {
        const avg = calculerMoyenne({ cc: grade.cc, tp: grade.tp, exam: grade.exam });
        const row = [
            `"${grade.subject}"`,
            grade.cc || '',
            grade.tp || '',
            grade.exam,
            grade.coef,
            avg.replace('.', ',') // French format often uses comma
        ].join(",");
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "releve_notes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Initial Render
renderTable();
