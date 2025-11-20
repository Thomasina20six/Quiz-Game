//DOM elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

// Quiz questions
const quizQuestions = [
  {
    question: "What is the capital of France?",
    answers: [
      { text: "Washington", correct: false },
      { text: "Berlin", correct: false },
      { text: "Paris", correct: true },
      { text: "Madrid", correct: false },
    ],
  },
  {
    question: "Which planet is known as the Red Planet?",
    answers: [
      { text: "Venus", correct: false },
      { text: "Mars", correct: true },
      { text: "Jupiter", correct: false },
      { text: "Mercury", correct: false },
    ],
  },
  {
    question: "What is the largest ocean on Earth?",
    answers: [
      { text: "Atlantic Ocean", correct: false },
      { text: "Indian Ocean", correct: false },
      { text: "Arctic Ocean", correct: false },
      { text: "Pacific Ocean", correct: true },
    ],
  },
  {
    question: "Which of these is NOT a programming language?",
    answers: [
      { text: "Java", correct: false },
      { text: "Python", correct: false },
      { text: "Emerald", correct: true },
      { text: "JavaScript", correct: false },
    ],
  },
  {
    question: "What is the chemical symbol for gold?",
    answers: [
      { text: "Go", correct: false },
      { text: "Gd", correct: false },
      { text: "Au", correct: true },
      { text: "Ag", correct: false },
    ],
  },
];

//quiz state vars
let currentQuestionIndex =0;
let score = 0;
let answerDisabled = false;

//limit 5 because thats the number of quiz in quizQuestions
totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;

//event listener
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

function startQuiz(){
  //console.log("quiz started");
  currentQuestionIndex=0;
  score=0;
  scoreSpan.textContent=0;

  //chnage into quiz display
  startScreen.classList.remove("active");
  quizScreen.classList.add("active");

  showQuestion();
}

function showQuestion(){
  // reset the state
  answerDisabled = false;

  const currentQuestion = quizQuestions[currentQuestionIndex];

  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  //fills the progress bar
  const progressPercent=(currentQuestionIndex / quizQuestions.length) * 100;
  progressBar.style.width = progressPercent + "%"; // change bar css width value to %

  questionText.textContent = currentQuestion.question

  answersContainer.innerHTML = ""; //clear the answer container

  // looping all the answers of a question
  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button"); // create a answer button
    button.textContent = answer.text;
    button.classList.add("answer-btn");
    
    button.dataset.correct = answer.correct;
    button.addEventListener("click",selectAnswer)

    answersContainer.appendChild(button); // append the button into html
  });
}

function selectAnswer(event){
  if(answerDisabled) return;

  answerDisabled = true;

  const selectedButton = event.target;
  const isCorrect = selectedButton.dataset.correct === "true";

  Array.from(answersContainer.children).forEach(button => {
    if(button.dataset.correct === "true"){
      button.classList.add("correct");
    } else if(button === selectedButton){
      button.classList.add("incorrect");
    }
  });

  if(isCorrect){
    score++;
    scoreSpan.textContent = score;
  }

  // delay the transitions
  setTimeout(() => {
    currentQuestionIndex++;

    if(currentQuestionIndex < quizQuestions.length){
      showQuestion();
    }else{
      showResults();
    }
  }, 1000)
}

function showResults(){
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  finalScoreSpan.textContent = score;

  const percentage = (score/quizQuestions.length) *100;

  if(percentage === 100) {
    resultMessage.textContent = "Perfect!";
  } else if(percentage >= 80) {
    resultMessage.textContent = "Great Job!";
  } else if(percentage >= 60) {
    resultMessage.textContent = "Good effort!";
  } else if(percentage >= 40) {
    resultMessage.textContent = "Not bad!";
  }else{
    resultMessage.textContent = "Keep studying!";
  }
}

function restartQuiz(){
    //console.log("quiz re-started");
    resultScreen.classList.remove("active");

    startQuiz();
}