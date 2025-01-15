document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('generateButton').addEventListener('click', generateTest);
document.getElementById('submitButton').addEventListener('click', checkAnswers);
document.getElementById('retryButton').addEventListener('click', retryTest);

let questions = [];
let currentTestQuestions = []; // Храним вопросы текущего теста

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    questions = parseQuestions(content);
    document.getElementById('questionCount').textContent = `Количество вопросов: ${questions.length}`;
  };
  reader.readAsText(file);
}

function parseQuestions(content) {
  const questionBlocks = content.split('++++').map(block => block.trim()).filter(Boolean);
  return questionBlocks.map(block => {
    const [questionLine, ...answerLines] = block.split('====').map(line => line.trim());
    const answers = answerLines.map(answer => ({
      text: answer.replace(/^#/, '').trim(),
      correct: answer.startsWith('#'),
    }));
    return { question: questionLine, answers };
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateTest() {
  const questionNumber = parseInt(document.getElementById('questionNumber').value, 10);
  if (isNaN(questionNumber) || questionNumber <= 0 || questionNumber > questions.length) {
    alert('Введите корректное количество вопросов.');
    return;
  }

  currentTestQuestions = [];
  const usedIndexes = new Set();

  while (currentTestQuestions.length < questionNumber) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    if (!usedIndexes.has(randomIndex)) {
      usedIndexes.add(randomIndex);
      currentTestQuestions.push(questions[randomIndex]);
    }
  }

  createTestPage(currentTestQuestions);
}

function createTestPage(selectedQuestions) {
  document.getElementById('uploadSection').classList.add('hidden');
  const testSection = document.getElementById('testSection');
  const testForm = document.getElementById('testForm');

  testForm.innerHTML = ''; // Очистка формы

  selectedQuestions.forEach((question, index) => {
    const questionElement = document.createElement('div');
    questionElement.className = 'question';
    questionElement.innerHTML = `<p><strong>${index + 1}. ${question.question}</strong></p>`;

    const shuffledAnswers = [...question.answers];
    shuffleArray(shuffledAnswers); // Перемешиваем ответы

    shuffledAnswers.forEach(answer => {
      const answerElement = document.createElement('div');
      answerElement.className = 'answer-option'; // Добавляем класс для оформления
      answerElement.innerHTML = `
        <label>
          <input type="radio" name="question-${index}" value="${answer.correct}">
          ${answer.text}
        </label>
      `;
      questionElement.appendChild(answerElement);
    });

    testForm.appendChild(questionElement);
  });

  testSection.classList.remove('hidden');
}


function checkAnswers() {
  const form = document.getElementById('testForm');
  const formData = new FormData(form);

  let correctCount = 0;

  currentTestQuestions.forEach((question, index) => {
    const selectedAnswer = formData.get(`question-${index}`);
    if (selectedAnswer === 'true') {
      correctCount++;
    }
  });

  showResults(correctCount, currentTestQuestions.length);
}

function showResults(correctCount, totalQuestions) {
  document.getElementById('testSection').classList.add('hidden');
  const resultSection = document.getElementById('resultSection');
  const resultText = document.getElementById('resultText');

  resultText.textContent = `Вы правильно ответили на ${correctCount} из ${totalQuestions} вопросов.`;
  resultSection.classList.remove('hidden');
}

function retryTest() {
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('uploadSection').classList.remove('hidden');
  currentTestQuestions = [];
  document.getElementById('fileInput').value = '';
  document.getElementById('questionCount').textContent = 'Количество вопросов: 0';
  document.getElementById('questionNumber').value = '';
}
