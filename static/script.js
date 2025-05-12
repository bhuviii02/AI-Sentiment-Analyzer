document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultCard = document.getElementById('result-card');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Sentiment Elements
    const sentimentBadge = document.getElementById('sentiment-badge');
    const positiveValue = document.getElementById('positive-value');
    const negativeValue = document.getElementById('negative-value');
    const neutralValue = document.getElementById('neutral-value');
    const positiveFill = document.getElementById('positive-fill');
    const negativeFill = document.getElementById('negative-fill');
    const neutralFill = document.getElementById('neutral-fill');
    const compoundScore = document.getElementById('compound-score');
    const scaleIndicator = document.getElementById('scale-indicator');

    // Character Counter
    textInput.addEventListener('input', () => {
        const count = textInput.value.length;
        charCount.textContent = `${count}/500`;
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Analyze Button Click Handler
    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze');
            return;
        }
        
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="btn-icon">⏳</span> Analyzing...';
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            
            if (!response.ok) {
                throw new Error('Analysis failed');
            }
            
            const data = await response.json();
            updateResults(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to analyze text. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span> Analyze Sentiment';
        }
    });

    // Update Results UI
    function updateResults(data) {
        // Update sentiment percentages
        const positivePercent = Math.round(data.scores.positive * 100);
        const negativePercent = Math.round(data.scores.negative * 100);
        const neutralPercent = Math.round(data.scores.neutral * 100);
        
        positiveValue.textContent = `${positivePercent}%`;
        negativeValue.textContent = `${negativePercent}%`;
        neutralValue.textContent = `${neutralPercent}%`;
        
        // Animate meter fills
        positiveFill.style.width = `${positivePercent}%`;
        negativeFill.style.width = `${negativePercent}%`;
        neutralFill.style.width = `${neutralPercent}%`;
        
        // Update compound score
        const compound = data.compound;
        compoundScore.textContent = compound.toFixed(2);
        
        // Position scale indicator (-1 to 1 maps to 0% to 100%)
        const indicatorPosition = ((compound + 1) / 2) * 100;
        scaleIndicator.style.left = `${indicatorPosition}%`;
        
        // Update sentiment badge
        sentimentBadge.textContent = data.sentiment.split(' ')[0];
        sentimentBadge.className = 'sentiment-badge';
        
        if (compound >= 0.05) {
            sentimentBadge.classList.add('positive');
            sentimentBadge.style.backgroundColor = 'var(--positive)';
        } else if (compound <= -0.05) {
            sentimentBadge.classList.add('negative');
            sentimentBadge.style.backgroundColor = 'var(--negative)';
        } else {
            sentimentBadge.classList.add('neutral');
            sentimentBadge.style.backgroundColor = 'var(--neutral)';
        }
        
        // Show results card
        resultCard.classList.add('visible');
    }
});