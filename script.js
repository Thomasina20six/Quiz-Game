//DOM elements
const startScreen = document.getElementById("start-screen");
const topicScreen = document.getElementById("topic-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const progressBar = document.getElementById("progress");

const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");

const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
//Topic screen
const topicChip = document.getElementById("topic-chip");
const topicSub = document.getElementById("topic-sub");
// --- Config ---
const API_URL = "/api/quiz";
const COUNT = 5;

// Quiz questions
const FALLBACK_QUESTIONS = [
  {
    question: "What is a black hole?",
    answers: [
      { text: "A star that shines very brightly", correct: false },
      { text: "A region in space where gravity is so strong that nothing can escape, not even light", correct: true },
      { text: "A hole drilled by humans in outer space", correct: false },
      { text: "A type of asteroid orbiting a planet", correct: false },
    ],
  },
  {
    question: "What is the boundary around a black hole called, beyond which nothing can escape?",
    answers: [
      { text: "Event Horizon", correct: true },
      { text: "Cosmic Shield", correct: false },
      { text: "Photon Belt", correct: false },
      { text: "Singularity Shell", correct: false },
    ],
  },
  {
    question: "Who first predicted the existence of black holes through the theory of general relativity?",
    answers: [
      { text: "Isaac Newton", correct: false },
      { text: "Stephen Hawking", correct: false },
      { text: "Albert Einstein", correct: true },
      { text: "Edwin Hubble", correct: false },
    ],
  },
  {
    question: "What is the name of the point at the very center of a black hole?",
    answers: [
      { text: "Event Horizon", correct: false },
      { text: "Singularity", correct: true },
      { text: "Photon Ring", correct: false },
      { text: "Accretion Disc", correct: false }
    ]
  },
  {
    question: "Which type of black hole is formed from the collapse of a massive star?",
    answers: [
      { text: "Primordial Black Hole", correct: false },
      { text: "Stellar-Mass Black Hole", correct: true },
      { text: "Supermassive Black Hole", correct: false },
      { text: "Mini Black Hole", correct: false }
    ]
  }
];

//quiz state vars
let currentQuestionIndex =0;
let score = 0;
let answerDisabled = false;
let quizQuestions =[];

//limit 5 because thats the number of quiz in quizQuestions
//totalQuestionsSpan.textContent = quizQuestions.length;
//maxScoreSpan.textContent = quizQuestions.length;

//event listener
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

// Helpers
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length -1;i>0;i--){
    const j =Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j],a[i]];
  }
  return a;
}

async function getQuizFromApi({topic = "", difficulty = "medium", count = COUNT} ={}){
  const url = new URL(API_URL, window.location.origin);
  if(topic) url.searchParams.set("topic", topic); //get random topic
  url.searchParams.set("difficulty", difficulty);
  url.searchParams.set("count", count);

  const res = await fetch(url.toString());
  if(!res.ok) throw new Error(`Quiz API error: ${res.status}`);

  const data = await res.json();
  if(!data || !Array.isArray(data.questions)) throw new Error("Invalid quiz payload");

  const mapped = data.questions.map((q) => {
    const answers = q.choices.map((text, i) => ({text, correct: i === q.correctIndex}));
    return {question:q.question,answers: shuffle(answers)};
  });

  return { topic: data.topic || topic || "General knowledge", questions: mapped };
}

async function startQuiz(){
  // reset state
  currentQuestionIndex=0;
  score=0;
  scoreSpan.textContent=0;
  progressBar.style.width ="0%";

  // 1) Show topic screen
  //const topicThisRun = DEFAULT_TOPIC;
  topicChip.textContent = "Choosing a topic...";
  topicSub.textContent= ``; 

  //chnage into quiz display
  startScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  topicScreen.classList.add("active");

  // 2) Generate with graceful fallback
  try{
    const {topic, questions} = await getQuizFromApi({count: COUNT});
    
    topicChip.textContent = topic; // show chosen topic
    topicSub.textContent = `Generating ${COUNT} questions...`;
    
    quizQuestions = questions;
  } catch (e){
    console.warn("Falling back to local set:", e);
    topicChip.textContent = "Black Holes"; // fallback topic
    topicSub.textContent = `Generating ${COUNT} questions...`;
    quizQuestions = FALLBACK_QUESTIONS
  }

  // 3) update totals based on fetch length
  totalQuestionsSpan.textContent = quizQuestions.length;
  maxScoreSpan.textContent = quizQuestions.length;

  // 4) Small pause so the Topic screen is visible
  setTimeout(() => {
    topicScreen.classList.remove("active");
    quizScreen.classList.add("active");
    showQuestion();
  }, 3000); //650
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
    button.dataset.correct = String(answer.correct);
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
  }, 800)
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
  startScreen.classList.add("active");
    //startQuiz();
}