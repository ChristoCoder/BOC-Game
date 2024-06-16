document.addEventListener('DOMContentLoaded', (event) => {
    loadPhrases();
});

let phrases = [];
let currentPhraseIndex = 0;
let currentPhrase = '';
let missingWords = [];
let blacklist = ['the', 'in', 'a', 'an', 'and', 'is', 'on', 'of', 'to', 'with']; // Base blacklist

// Extend the blacklist to include numeric and alphabetic list elements, words with numbers, and Roman numerals
for (let i = 1; i <= 9; i++) {
    blacklist.push(`${i})`);
    blacklist.push(`${i}.`);
    blacklist.push(`${i}-`);
    blacklist.push(`${i}`);
    blacklist.push(`(${i})`);
}
for (let i = 65; i <= 90; i++) { // ASCII values for A-Z
    let letter = String.fromCharCode(i);
    blacklist.push(`${letter}.)`);
    blacklist.push(`${letter}.`);
    blacklist.push(`${letter}-`);
    blacklist.push(`(${letter})`);
}

// Roman numerals up to 20
const romanNumerals = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"
];
romanNumerals.forEach(numeral => {
    blacklist.push(`${numeral}.`);
    blacklist.push(`${numeral})`);
});

function addWordsWithNumbersToBlacklist(words) {
    words.forEach(word => {
        if (/\d/.test(word)) {
            blacklist.push(word);
        }
    });
}

async function loadPhrases() {
    try {
        const response = await fetch('phrases.txt');
        const text = await response.text();
        phrases = text.split('\n').filter(Boolean);
        addWordsWithNumbersToBlacklist(phrases.join(' ').split(/[\s\-]/));
        displayPhrase();
    } catch (error) {
        console.error('Error loading phrases:', error);
        document.getElementById('phrase').innerText = 'Failed to load phrases. Please try again.';
    }
}

function displayPhrase() {
    if (currentPhraseIndex >= phrases.length) {
        currentPhraseIndex = 0; // Reset to the beginning if we reach the end
    }

    currentPhrase = phrases[currentPhraseIndex];
    document.getElementById('phrase').innerText = maskWords(currentPhrase);
    currentPhraseIndex++;
}

function maskWords(phrase) {
    missingWords = [];
    let words = phrase.split(' ');

    words = words.map(word => {
        if (shouldMaskWord(word)) {
            missingWords.push(word);
            return '_'.repeat(word.length);
        }
        return word;
    });

    return words.join(' ');
}

function shouldMaskWord(word) {
    word = word.replace(/[.,!?;:()]/g, '').toLowerCase();
    return !blacklist.includes(word);
}

document.getElementById('next-phrase').addEventListener('click', displayPhrase);

document.getElementById('reveal').addEventListener('click', () => {
    document.getElementById('phrase').innerText = currentPhrase;
});
