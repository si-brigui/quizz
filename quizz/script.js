// Quiz and leaderboard variables
const apiUrlBase =
  "https://opentdb.com/api.php?amount=10&type=multiple&category=";
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let username = "";
let leaderboard = [];
let selectedCategory = "";

// DOM Elements
const loginContainer = document.getElementById("login-container");
const categoryContainer = document.getElementById("category-container");
const quizContainer = document.getElementById("quiz-container");
const leaderboardContainer = document.getElementById("leaderboard-container");
const questionContainer = document.getElementById("question-container");
const answerButtons = document.getElementById("answer-buttons");
const playAgainButton = document.getElementById("play-again-button");
const exitButton = document.getElementById("exit-button");
const usernameInput = document.getElementById("username");
const errorMessage = document.getElementById("error-message");
const leaderboardList = document.getElementById("leaderboard");
const categoryTitle = document.getElementById("category-title");

// Fun facts
const facts = [
  "Did you know? Honey never spoils!",
  "The Eiffel Tower can grow more than 6 inches during summer.",
  "Sharks existed before trees!",
  "Bananas are berries, but strawberries aren't.",
];

let factIndex = 0;

// Rotate fun facts
function updateFunFact() {
  const funFactElement = document.getElementById("fun-fact");
  factIndex = (factIndex + 1) % facts.length;
  funFactElement.textContent = facts[factIndex];
}
setInterval(updateFunFact, 5000);

// Load leaderboard from local storage
function loadLeaderboard() {
  leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
}

// Update leaderboard
function updateLeaderboard() {
  leaderboardList.innerHTML = "";
  const uniqueLeaderboard = {};
  leaderboard.forEach((entry) => {
    if (
      !uniqueLeaderboard[entry.username] ||
      uniqueLeaderboard[entry.username] < entry.score
    ) {
      uniqueLeaderboard[entry.username] = entry.score;
    }
  });

  const sortedLeaderboard = Object.entries(uniqueLeaderboard).sort(
    (a, b) => b[1] - a[1]
  );
  sortedLeaderboard.forEach(([username, score]) => {
    const li = document.createElement("li");
    li.textContent = `${username}: ${score}`;
    leaderboardList.appendChild(li);
  });
}
document.getElementById("reset-button").addEventListener("click", () => {
  localStorage.removeItem("leaderboard"); // Clear leaderboard data from localStorage
  document.getElementById("leaderboard").innerHTML = ""; // Clear leaderboard UI
  alert("Leaderboard has been reset!");
});

// Login functionality
document.getElementById("login-button").addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  errorMessage.classList.add("hidden");
  loginContainer.classList.add("hidden");
  categoryContainer.classList.remove("hidden");
});

// Category selection
document.querySelectorAll(".category-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.getAttribute("data-category");
    categoryTitle.textContent = button.textContent;
    categoryContainer.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    loadQuestions(selectedCategory);
  });
});

// Fetch questions from API
async function loadQuestions(category) {
  try {
    const response = await fetch(apiUrlBase + category);
    const data = await response.json();
    questions = data.results;
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
  } catch (error) {
    alert("Error loading questions.");
  }
}

// Display a question
function showQuestion() {
  const question = questions[currentQuestionIndex];
  questionContainer.textContent = question.question;
  answerButtons.innerHTML = "";
  const answers = [...question.incorrect_answers, question.correct_answer];
  shuffleArray(answers);
  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.classList.add("btn");
    button.addEventListener("click", () =>
      handleAnswer(answer, question.correct_answer)
    );
    answerButtons.appendChild(button);
  });
}

// Shuffle answers
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Handle answer selection
function handleAnswer(selectedAnswer, correctAnswer) {
  Array.from(answerButtons.children).forEach((button) => {
    if (button.textContent === correctAnswer) {
      button.classList.add("correct");
    } else if (
      button.textContent === selectedAnswer &&
      selectedAnswer !== correctAnswer
    ) {
      button.classList.add("incorrect");
    } else {
      button.style.backgroundColor = "#ccc";
    }
  });

  if (selectedAnswer === correctAnswer) {
    score++;
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      endGame();
    }
  }, 1000);
}

// End game and show leaderboard
function endGame() {
  quizContainer.classList.add("hidden");
  leaderboardContainer.classList.remove("hidden");
  leaderboard.push({ username, score });
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  updateLeaderboard();
}

// Restart the quiz
playAgainButton.addEventListener("click", () => {
  leaderboardContainer.classList.add("hidden");
  categoryContainer.classList.remove("hidden");
});

// Exit back to username entry
exitButton.addEventListener("click", () => {
  leaderboardContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
});

// Initialize on load
window.onload = () => {
  loadLeaderboard();
  updateLeaderboard();
};
