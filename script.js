/**
 * Standalone Match Prediction Form Widget - JavaScript Logic
 */

function onWinnerSelect(team) {
    const argCard = document.querySelector('.option-arg');
    const engCard = document.querySelector('.option-eng');
    
    if (team === 'argentina') {
        argCard?.classList.add('selected');
        engCard?.classList.remove('selected');
    } else if (team === 'england') {
        engCard?.classList.add('selected');
        argCard?.classList.remove('selected');
    }
}

/**
 * Check if regular Match Score is a Tie, and dynamically show/hide the Penalty Shootout option
 */
function checkTieAndTogglePenalty() {
    const argScoreInput = document.getElementById('argScore');
    const engScoreInput = document.getElementById('engScore');
    const penaltySection = document.getElementById('penalty-score-section');
    const scoresGrid = document.querySelector('.scores-grid');

    if (!argScoreInput || !engScoreInput || !penaltySection) return;

    const argVal = parseInt(argScoreInput.value, 10);
    const engVal = parseInt(engScoreInput.value, 10);

    if (!isNaN(argVal) && !isNaN(engVal) && argVal === engVal && !(argVal === 0 && engVal === 0)) {
        penaltySection.classList.add('visible');
        penaltySection.style.setProperty('display', 'flex', 'important');
        penaltySection.style.setProperty('opacity', '1', 'important');
        penaltySection.style.setProperty('visibility', 'visible', 'important');
        if (scoresGrid) {
            scoresGrid.classList.add('tie-active');
            if (window.innerWidth <= 950) {
                scoresGrid.style.setProperty('display', 'flex', 'important');
                scoresGrid.style.setProperty('flex-direction', 'column', 'important');
            }
        }
    } else {
        penaltySection.classList.remove('visible');
        penaltySection.style.setProperty('display', 'none', 'important');
        penaltySection.style.setProperty('opacity', '0', 'important');
        penaltySection.style.setProperty('visibility', 'hidden', 'important');
        if (scoresGrid) {
            scoresGrid.classList.remove('tie-active');
            scoresGrid.style.removeProperty('display');
            scoresGrid.style.removeProperty('flex-direction');
        }
    }
}

/**
 * Score input adjustment via up/down arrows
 */
function adjustScore(inputId, delta) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let val = parseInt(input.value, 10);
    if (isNaN(val)) val = 0;

    val += delta;
    if (val < 0) val = 0;
    if (val > 15) val = 15;

    input.value = val;
    checkTieAndTogglePenalty();
}

/**
 * Google Apps Script Web App URL
 */
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw2E22rIWIYbP-rRUjoZO_MnwCPCV45s-dtCJ_aZkVV2avcSHMY9dSkfnmtOpfVo76hAQ/exec";

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName')?.value.trim();
    const phoneNumber = document.getElementById('phoneNumber')?.value.trim();
    const winnerChoice = document.querySelector('input[name="winnerChoice"]:checked')?.value;
    const argScore = document.getElementById('argScore')?.value || '0';
    const engScore = document.getElementById('engScore')?.value || '0';
    const argPenScore = document.getElementById('argPenScore')?.value || '0';
    const engPenScore = document.getElementById('engPenScore')?.value || '0';

    if (!fullName || !phoneNumber || !winnerChoice) {
        alert('Please complete all required fields (*)');
        return;
    }

    // Prepare match score strings
    const matchScoreStr = `${argScore} - ${engScore}`;
    let penScoreStr = 'N/A';
    const argP = parseInt(argPenScore, 10) || 0;
    const engP = parseInt(engPenScore, 10) || 0;
    const argS = parseInt(argScore, 10) || 0;
    const engS = parseInt(engScore, 10) || 0;

    if (argS === engS && !(argS === 0 && engS === 0)) {
        const penWinner = argP > engP ? ' (ARG)' : engP > argP ? ' (ENG)' : '';
        penScoreStr = `${argP} - ${engP}${penWinner}`;
    }

    // Populate confirmation modal elements early
    const tName = document.getElementById('t-name');
    const tPhone = document.getElementById('t-phone');
    const tWinner = document.getElementById('t-winner');
    const tScore = document.getElementById('t-score');
    const tPenScore = document.getElementById('t-pen-score');
    const penRow = document.getElementById('pen-ticket-row');

    if (tName) tName.textContent = fullName;
    if (tPhone) {
        const masked = phoneNumber.length > 6 
            ? phoneNumber.slice(0, 4) + ' •••• ' + phoneNumber.slice(-4) 
            : phoneNumber;
        tPhone.textContent = masked;
    }
    if (tScore) tScore.textContent = matchScoreStr;

    if (tPenScore && penRow) {
        if (argS === engS && !(argS === 0 && engS === 0)) {
            penRow.style.display = 'flex';
            tPenScore.textContent = penScoreStr;
        } else {
            penRow.style.display = 'none';
        }
    }

    if (tWinner) {
        if (winnerChoice === 'argentina') {
            tWinner.textContent = 'Argentina 🇦🇷';
            tWinner.style.color = '#00d2ff';
        } else {
            tWinner.textContent = 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿';
            tWinner.style.color = '#ff1e56';
        }
    }

    // Show loading indicator on submit button
    const submitBtn = document.querySelector('.btn-submit');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="btn-text">Saving to Google Sheet... ⏳</span>`;
    }

    // Construct POST payload using URLSearchParams to avoid CORS preflight blocks
    const payload = new URLSearchParams();
    payload.append('fullName', fullName);
    payload.append('phoneNumber', phoneNumber);
    payload.append('winnerChoice', winnerChoice.toUpperCase());
    payload.append('matchScore', matchScoreStr);
    payload.append('penaltyScore', penScoreStr);

    // Send prediction data to Google Apps Script Web App
    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: payload,
        mode: 'no-cors'
    })
    .then(() => {
        // Complete submission & celebrate
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
        launchConfetti();
        const modal = document.getElementById('success-modal');
        if (modal) modal.classList.add('active');
    })
    .catch((error) => {
        console.error('Error submitting to Google Sheets:', error);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
        // Even if browser blocks response read due to no-cors, launch celebration
        launchConfetti();
        const modal = document.getElementById('success-modal');
        if (modal) modal.classList.add('active');
    });
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Lightweight Canvas Confetti Celebration
 */
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00f2ff', '#0072ff', '#ff1e56', '#ffd700', '#ffffff'];

    for (let i = 0; i < 160; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() - 0.75) * 18,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 12
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;

        particles.forEach(p => {
            if (p.alpha <= 0) return;
            activeParticles++;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.32; // Gravity
            p.alpha -= 0.009;
            p.rotation += p.vRot;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(p.alpha, 0);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        if (activeParticles > 0) {
            requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    render();
}

// Close modal on ESC key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSuccessModal();
});

// Run tie check on page load
document.addEventListener('DOMContentLoaded', checkTieAndTogglePenalty);
