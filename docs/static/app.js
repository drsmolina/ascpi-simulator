// ASCP(i) Exam Simulator Frontend JavaScript

let currentSession = null;
let currentQuestionId = null;
let selectedAnswer = null;

// DOM Elements
const startExamBtn = document.getElementById('startExam');
const examArea = document.getElementById('examArea');
const questionArea = document.getElementById('questionArea');
const resultArea = document.getElementById('resultArea');
const completionArea = document.getElementById('completionArea');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const categoryBadge = document.getElementById('categoryBadge');
const difficultyBadge = document.getElementById('difficultyBadge');
const questionStem = document.getElementById('questionStem');
const optionsArea = document.getElementById('optionsArea');
const submitAnswerBtn = document.getElementById('submitAnswer');
const nextQuestionBtn = document.getElementById('nextQuestion');
const restartExamBtn = document.getElementById('restartExam');
const answerFeedback = document.getElementById('answerFeedback');

// Category colors
const categoryColors = {
    'BloodBank': 'bg-red-100 text-red-800',
    'Chemistry': 'bg-blue-100 text-blue-800',
    'Hematology': 'bg-purple-100 text-purple-800',
    'Microbiology': 'bg-green-100 text-green-800',
    'Urinalysis': 'bg-yellow-100 text-yellow-800',
    'Immunology': 'bg-indigo-100 text-indigo-800',
    'LabOps': 'bg-gray-100 text-gray-800'
};

const categoryNames = {
    'BloodBank': 'Blood Banking',
    'Chemistry': 'Clinical Chemistry',
    'Hematology': 'Hematology',
    'Microbiology': 'Microbiology',
    'Urinalysis': 'Urinalysis',
    'Immunology': 'Immunology/Serology',
    'LabOps': 'Laboratory Operations'
};

// Event Listeners
startExamBtn.addEventListener('click', startExam);
submitAnswerBtn.addEventListener('click', submitAnswer);
nextQuestionBtn.addEventListener('click', loadNextQuestion);
restartExamBtn.addEventListener('click', restartExam);

async function startExam() {
    try {
        showLoading('Starting exam...');
        const response = await axios.post('/api/session/start');
        currentSession = response.data.sessionId;
        
        startExamBtn.style.display = 'none';
        examArea.classList.remove('hidden');
        
        await loadNextQuestion();
    } catch (error) {
        console.error('Error starting exam:', error);
        alert('Failed to start exam. Please try again.');
    }
}

async function loadNextQuestion() {
    try {
        showLoading('Loading question...');
        
        const response = await axios.get(`/api/session/${currentSession}/question`);
        const question = response.data;
        
        currentQuestionId = question.questionId;
        selectedAnswer = null;
        
        // Update progress
        updateProgress(question.itemIndex, question.totalItems);
        
        // Update question display
        displayQuestion(question);
        
        // Show question area, hide result area
        questionArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        
    } catch (error) {
        console.error('Error loading question:', error);
        if (error.response?.data?.error === 'Session completed') {
            showCompletion();
        } else {
            alert('Failed to load question. Please try again.');
        }
    }
}

function displayQuestion(question) {
    // Update category badge
    categoryBadge.textContent = categoryNames[question.category] || question.category;
    categoryBadge.className = `inline-block text-xs font-semibold px-2.5 py-0.5 rounded ${categoryColors[question.category] || 'bg-gray-100 text-gray-800'}`;
    
    // Update difficulty badge
    const difficultyStars = '★'.repeat(question.difficulty) + '☆'.repeat(5 - question.difficulty);
    difficultyBadge.textContent = `Difficulty: ${difficultyStars}`;
    
    // Update question stem
    questionStem.textContent = question.stem;
    
    // Update options
    optionsArea.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition duration-200';
        optionDiv.innerHTML = `
            <input type=\"radio\" name=\"answer\" value=\"${index}\" id=\"option${index}\" class=\"mr-3\">
            <label for=\"option${index}\" class=\"cursor-pointer flex-1\">${String.fromCharCode(65 + index)}. ${option}</label>
        `;
        
        optionDiv.addEventListener('click', () => selectOption(index));
        optionsArea.appendChild(optionDiv);
    });
    
    // Reset submit button
    submitAnswerBtn.disabled = true;
    submitAnswerBtn.classList.add('opacity-50');
}

function selectOption(index) {
    selectedAnswer = index;
    
    // Update radio buttons
    const radios = document.querySelectorAll('input[name=\"answer\"]');
    radios.forEach((radio, i) => {
        radio.checked = i === index;
    });
    
    // Update visual selection
    const options = optionsArea.children;
    Array.from(options).forEach((option, i) => {
        if (i === index) {
            option.classList.add('bg-blue-100', 'border-blue-300');
            option.classList.remove('bg-gray-50');
        } else {
            option.classList.remove('bg-blue-100', 'border-blue-300');
            option.classList.add('bg-gray-50');
        }
    });
    
    // Enable submit button
    submitAnswerBtn.disabled = false;
    submitAnswerBtn.classList.remove('opacity-50');
}

async function submitAnswer() {
    if (selectedAnswer === null) return;
    
    try {
        showLoading('Submitting answer...');
        
        const response = await axios.post(`/api/session/${currentSession}/answer`, {
            questionId: currentQuestionId,
            selectedIndex: selectedAnswer
        });
        
        const result = response.data;
        showResult(result);
        
        if (result.completed) {
            nextQuestionBtn.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error submitting answer:', error);
        alert('Failed to submit answer. Please try again.');
    }
}

function showResult(result) {
    // Hide question area, show result area
    questionArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    
    // Show feedback
    const isCorrect = result.correct;
    const correctLetter = String.fromCharCode(65 + result.correctIndex);
    
    let feedbackHTML = '';\n    if (isCorrect) {\n        feedbackHTML = `\n            <div class=\"bg-green-50 border border-green-200 rounded-lg p-4\">\n                <div class=\"flex items-center mb-2\">\n                    <i class=\"fas fa-check-circle text-green-600 mr-2\"></i>\n                    <span class=\"font-semibold text-green-800\">Correct!</span>\n                </div>\n                <p class=\"text-green-700\">You selected ${String.fromCharCode(65 + selectedAnswer)}. That's the right answer!</p>\n                ${result.explanation ? `<p class=\"text-green-600 mt-2 text-sm\">${result.explanation}</p>` : ''}\n            </div>\n        `;\n    } else {\n        feedbackHTML = `\n            <div class=\"bg-red-50 border border-red-200 rounded-lg p-4\">\n                <div class=\"flex items-center mb-2\">\n                    <i class=\"fas fa-times-circle text-red-600 mr-2\"></i>\n                    <span class=\"font-semibold text-red-800\">Incorrect</span>\n                </div>\n                <p class=\"text-red-700\">You selected ${String.fromCharCode(65 + selectedAnswer)}. The correct answer is ${correctLetter}.</p>\n                ${result.explanation ? `<p class=\"text-red-600 mt-2 text-sm\">${result.explanation}</p>` : ''}\n            </div>\n        `;\n    }\n    \n    answerFeedback.innerHTML = feedbackHTML;\n    \n    if (result.completed) {\n        setTimeout(() => showCompletion(), 2000);\n    }\n}\n\nfunction showCompletion() {\n    questionArea.classList.add('hidden');\n    resultArea.classList.add('hidden');\n    completionArea.classList.remove('hidden');\n}\n\nfunction restartExam() {\n    currentSession = null;\n    currentQuestionId = null;\n    selectedAnswer = null;\n    \n    examArea.classList.add('hidden');\n    completionArea.classList.add('hidden');\n    startExamBtn.style.display = 'inline-block';\n    \n    updateProgress(0, 100);\n}\n\nfunction updateProgress(current, total) {\n    const percentage = Math.round((current / total) * 100);\n    progressBar.style.width = `${percentage}%`;\n    progressText.textContent = `${current}/${total}`;\n}\n\nfunction showLoading(message) {\n    // Simple loading state - you could make this more sophisticated\n    console.log(message);\n}\n\n// Initialize\ndocument.addEventListener('DOMContentLoaded', () => {\n    console.log('ASCP(i) Exam Simulator loaded');\n});