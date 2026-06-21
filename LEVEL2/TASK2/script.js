let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];

function showSection(id) {
    document.querySelectorAll('#app > div').forEach(div => div.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'browse') renderQuizList();
}

function addQuestionField() {
    const div = document.createElement('div');
    div.innerHTML = `<input type="text" class="q-text" placeholder="Question">
                     <input type="text" class="q-ans" placeholder="Correct Answer">`;
    document.getElementById('questionsContainer').appendChild(div);
}

function saveQuiz() {
    const title = document.getElementById('quizTitle').value;
    const questions = Array.from(document.querySelectorAll('#questionsContainer > div')).map(div => ({
        question: div.querySelector('.q-text').value,
        answer: div.querySelector('.q-ans').value
    }));
    quizzes.push({ title, questions });
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    alert('Quiz Saved!');
    showSection('home');
}

function renderQuizList() {
    const list = document.getElementById('quizList');
    list.innerHTML = quizzes.map((q, i) => `<div class="quiz-item" onclick="takeQuiz(${i})">${q.title}</div>`).join('');
}

function takeQuiz(index) {
    const quiz = quizzes[index];
    let score = 0;
    quiz.questions.forEach(q => {
        const userAns = prompt(q.question);
        if(userAns === q.answer) score++;
    });
    alert(`You scored ${score} out of ${quiz.questions.length}`);
}