const scrollTopBtn = document.getElementById('scrollTopBtn');
const whatsappFab = document.getElementById('whatsappFab');
const aiChatWindow = document.getElementById('aiChatWindow');
const aiChatBody = document.getElementById('aiChatBody');
const aiInput = document.getElementById('aiInput');

let KPS_Brain = { webData: "", isAIClose: false };

// 1. Scraper: Auto-read website content
async function trainAIBrain() {
    const pages = ['about.html', 'facilities.html', 'MandatoryDisclosure.html', 'contact.html', 'fees.html'];
    for (let page of pages) {
        try {
            const res = await fetch(page);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            KPS_Brain.webData += " " + doc.body.innerText.replace(/\s+/g, ' ').trim();
        } catch (e) { console.log("Indexing Error: " + page); }
    }
}

// 2. Main AI Response Logic
async function askAdvancedAI() {
    const query = aiInput.value.trim().toLowerCase();
    if (!query) return;

    aiChatBody.innerHTML += `<div class="user-msg">${query}</div>`;
    aiInput.value = "";
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    // Show Typing Animation
    const typingId = "typing-" + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = "typing-dots";
    typingDiv.innerHTML = `<span></span><span></span><span></span>`;
    aiChatBody.appendChild(typingDiv);

    let response = "";
    const serialMatch = query.match(/kps\d+/);

    // AI Logic Processing
    if (serialMatch) {
        response = `Searching records for ${serialMatch[0].toUpperCase()}... (Please connect Firebase to fetch live fees)`;
    } else if (query.includes("attendance") && new Date().getMonth() === 3) {
        response = "Session has just started in April. Attendance will be updated from May.";
    } else {
        const sentences = KPS_Brain.webData.split(/[.!?]/);
        const match = sentences.find(s => s.toLowerCase().includes(query.split(' ')[0]) && s.length > 15);
        response = match ? match.trim() + "." : "Sorry, I can't find this info. Contact: +91-8299390677 (8 AM - 2 PM).";
    }

    // Delay for realism
    setTimeout(() => {
        document.getElementById(typingId).remove();
        aiChatBody.innerHTML += `<div class="bot-msg"><b>AI:</b> ${response}</div>`;
        if (response.includes("Contact")) {
            aiChatBody.innerHTML += `<a href="https://wa.me/8299390677" target="_blank" style="color:#25d366; font-size:12px; margin-left:10px;">Chat on WhatsApp</a>`;
        }
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }, 1500);
}

// 3. UI Control Functions
window.toggleAIChat = () => {
    aiChatWindow.style.display = (aiChatWindow.style.display === 'flex') ? 'none' : 'flex';
};

window.closeFab = () => {
    whatsappFab.style.display = 'none';
    KPS_Brain.isAIClose = true;
    handleScrollLogic(); // Re-trigger scroll check
};

// 4. SCROLL LOGIC (Your perfect logic)
function handleScrollLogic() {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    if (KPS_Brain.isAIClose && scrollPos > 200) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
}

// Event Listeners
window.addEventListener('scroll', handleScrollLogic);
window.onload = trainAIBrain;
aiInput.addEventListener("keypress", (e) => { if (e.key === "Enter") askAdvancedAI(); });
