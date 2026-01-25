const scrollTopBtn = document.getElementById('scrollTopBtn');
const whatsappFab = document.getElementById('whatsappFab');
const aiChatWindow = document.getElementById('aiChatWindow');
const aiChatBody = document.getElementById('aiChatBody');
const aiInput = document.getElementById('aiInput');

let KPS_Brain = { webData: {}, isAIClose: false };

// 1. IMPROVED SCRAPER: Har page ko sentences mein tod kar save karega
async function trainAIBrain() {
    const pages = [
        { name: 'about', file: 'about.html' },
        { name: 'facilities', file: 'facilities.html' },
        { name: 'fees', file: 'fees.html' },
        { name: 'admission', file: 'admission.html' },
        { name: 'contact', file: 'contact.html' }
    ];

    for (let p of pages) {
        try {
            const res = await fetch(p.file);
            if (!res.ok) continue;
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            // Data ko sentences mein store kar rahe hain taaki filtering easy ho
            KPS_Brain.webData[p.name] = doc.body.innerText.replace(/\s+/g, ' ').trim();
        } catch (e) { console.warn("File missing: " + p.file); }
    }
}

// 2. SMART FILTERING ENGINE
function findSmartAnswer(category, userQuery) {
    const pageContent = KPS_Brain.webData[category];
    if (!pageContent) return null;

    // Content ko sentences mein divide karo
    const sentences = pageContent.split(/[.!?\n]/);
    
    // Query mein se important keywords nikaalo (e.g., "10", "class")
    const keywords = userQuery.toLowerCase().split(' ').filter(word => word.length > 2);
    
    // Wo sentences dhoondo jisme max keywords match ho rahe hon
    let matches = sentences.filter(s => 
        keywords.every(k => s.toLowerCase().includes(k))
    );

    if (matches.length > 0) {
        return matches.join('. ').trim(); // Sirf matching part return karo
    }
    return pageContent.substring(0, 300); // Fallback to start of page
}

// 3. MAIN AI LOGIC
async function askAdvancedAI() {
    const query = aiInput.value.trim().toLowerCase();
    if (!query) return;

    aiChatBody.innerHTML += `<div class="user-msg">${query}</div>`;
    aiInput.value = "";
    
    const typingId = "typing-" + Date.now();
    aiChatBody.innerHTML += `<div id="${typingId}" class="typing-dots"><span></span><span></span><span></span></div>`;
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    let response = "";

    // A. DATABASE SEARCH (Only for Standalone Numbers like 101, 102)
    const isOnlyID = /^\d{1,4}$/.test(query); 
    if (isOnlyID) {
        try {
            // FIREBASE CHECK: Make sure 'firebase' and 'db' are ready
            if (window.db) {
                const snapshot = await db.ref('students/' + query).once('value');
                const data = snapshot.val();
                if (data) {
                    response = `<b>Student Found:</b> ${data.name.toUpperCase()}<br>Fee Status: ${data.fees.i}`;
                } else {
                    response = `No record found for ID: ${query}.`;
                }
            } else {
                response = "Database is not connected. Please check Firebase initialization.";
            }
        } catch (e) { response = "Database Connection Error."; }
    }

    // B. SMART WEB SEARCH (Admission, Fees, etc.)
    if (!response) {
        const categories = {
            admission: ["admission", "join", "form", "apply", "procedure"],
            fees: ["fee", "structure", "installment", "pay", "paisa", "class"],
            facilities: ["facility", "bus", "lab", "sports"],
            about: ["principal", "owner", "about", "school"],
            contact: ["contact", "phone", "call", "address"]
        };

        let matchedCat = Object.keys(categories).find(cat => 
            categories[cat].some(keyword => query.includes(keyword))
        );

        if (matchedCat) {
            const result = findSmartAnswer(matchedCat, query);
            response = result ? `<b>${matchedCat.toUpperCase()}:</b> ${result}` : `Information about ${matchedCat} is available on our website.`;
        } else {
            response = "I couldn't find specific details. Please ask about Fees, Admission, or enter a Student ID.";
        }
    }

    setTimeout(() => {
        const t = document.getElementById(typingId);
        if (t) t.remove();
        aiChatBody.innerHTML += `<div class="bot-msg"><b>KPS AI:</b><br>${response}</div>`;
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }, 1000);
}

// UI Toggles & Scroll
window.toggleAIChat = () => { aiChatWindow.style.display = (aiChatWindow.style.display === 'flex') ? 'none' : 'flex'; };
window.closeFab = () => { whatsappFab.style.display = 'none'; KPS_Brain.isAIClose = true; handleScrollLogic(); };

function handleScrollLogic() {
    const pos = window.pageYOffset || document.documentElement.scrollTop;
    if (KPS_Brain.isAIClose && pos > 200) scrollTopBtn.style.display = "block";
    else scrollTopBtn.style.display = "none";
}

window.addEventListener('scroll', handleScrollLogic);
window.onload = trainAIBrain;
aiInput.addEventListener("keypress", (e) => { if (e.key === "Enter") askAdvancedAI(); });
