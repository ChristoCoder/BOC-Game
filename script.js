document.addEventListener('DOMContentLoaded', () => {
    loadPhrases();
});

let phrases = [];
let currentPhraseIndex = 0;
let currentPhrase = '';
let missingWords = [];
const blacklist = [
    'the', 'in', 'a', 'an', 'and', 'is', 'on', 'of', 'to', 'with', 'for', 'I', 'you', 'he', 'she', 'it', 
    'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 
    'mine', 'yours', 'hers', 'ours', 'theirs'
]; // Extend this list to include any other words you want to exclude from blanks.

async function loadPhrases() {
    try {
        const response = await fetch('phrases.txt');
        const text = await response.text();
        phrases = text.split('\n').map(line => line.trim()).filter(Boolean); // Trim each line to remove any leading or trailing whitespace
        displayPhrase();
    } catch (error) {
        console.error('Error loading phrases:', error);
        document.getElementById('phrase').innerText = 'Failed to load phrases. Please try again.';
    }
}

function getRandomWords(words, count) {
    let result = new Set();
    let attempts = 0; // To prevent infinite loops in case of an issue with the word list

    while (result.size < count && attempts < 100) {
        let randomIndex = Math.floor(Math.random() * words.length);
        let word = words[randomIndex];
        // Exclude blacklisted words, single letters, and words followed by punctuation
        if (!blacklist.includes(word.toLowerCase()) &&
            word.length > 1 &&
            !/^\d+$/.test(word) && // Exclude numbers
            !/[.,!?;:]$/.test(word) && // Exclude words followed by punctuation
            !/^[A-Z]\.$/.test(word) && // Exclude words like "A.", "B.", etc.
            !result.has(word)
        ) {
            result.add(word);
        }
        attempts++;
    }
    return [...result];
}

function processPhrase(phrase) {
    let words = phrase.split(' ');
    let blanksCount = Math.min(4, words.length);
    missingWords = getRandomWords(words, blanksCount);

    let blankedPhrase = words.map(word =>
        missingWords.includes(word) ? '___' : word
    ).join(' ');

    // Maintain the order of missing words as they appear in the phrase
    missingWords = words.filter(word => missingWords.includes(word));
    return blankedPhrase;
}

function displayPhrase() {
    if (currentPhraseIndex < phrases.length) {
        currentPhrase = phrases[currentPhraseIndex];
        let blankedPhrase = processPhrase(currentPhrase);
        document.getElementById('phrase').innerText = blankedPhrase;
        document.getElementById('feedback').innerText = '';
        document.getElementById('user-input').value = '';
        document.getElementById('next-button').style.display = 'none';
        document.getElementById('submit-button').style.display = 'inline';
    } else {
        document.getElementById('phrase').innerText = 'No more phrases!';
        document.getElementById('user-input').style.display = 'none';
        document.getElementById('submit-button').style.display = 'none';
        document.getElementById('next-button').style.display = 'none';
    }
}

function checkAnswer() {
    let userInput = document.getElementById('user-input').value.trim();
    let userWords = userInput.split(' ').map(word => word.toLowerCase().replace(/[.,!?;:]/g, ''));
    let correctWords = missingWords.map(word => word.toLowerCase().replace(/[.,!?;:]/g, ''));
    let feedbackElement = document.getElementById('feedback');

    console.log('User words:', userWords);
    console.log('Correct words:', correctWords);

    if (userWords.length === correctWords.length) {
        let allCorrect = userWords.every((word, index) => word === correctWords[index]);
        if (allCorrect) {
            feedbackElement.innerText = 'Correct!';
            document.getElementById('next-button').style.display = 'inline';
            document.getElementById('submit-button').style.display = 'none';
        } else {
            feedbackElement.innerText = `Incorrect! The correct words were: ${missingWords.join(', ')}`;
            document.getElementById('next-button').style.display = 'inline';
            document.getElementById('submit-button').style.display = 'none';
        }
    } else {
        feedbackElement.innerText = `Please provide ${missingWords.length} words in the correct order.`;
    }
}

function nextPhrase() {
    currentPhraseIndex++;
    displayPhrase();
}

function togglePhrases() {
    let phrasesList = document.getElementById('phrases-list');
    phrasesList.innerHTML = ''; // Clear previous content

    if (phrasesList.style.display === 'none') {
        // Display the phrases list
        phrases.forEach((phrase, index) => {
            let li = document.createElement('li');
            li.textContent = `${phrase}`;
            phrasesList.appendChild(li);
        });
        phrasesList.style.display = 'block';
    } else {
        // Hide the phrases list
        phrasesList.style.display = 'none';
    }
}
