const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");

function addMessage(text, type) {
    const div = document.createElement("div");
    div.classList.add("message", type);
    div.innerHTML = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const question = userInput.value.trim();
    if (!question) return;

    addMessage(question, "user");
    userInput.value = "";
    addMessage("टाइप गर्दैछ...", "bot");

    try {
        const res = await fetch("https://grok.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer dummy" // free public endpoint (fallback use)
            },
            body: JSON.stringify({
                model: "grok-beta",
                messages: [{role:"user", content: question}],
                temperature: 0.7
            })
        });

        // Fallback to free Gemini API if Grok fails
        let answer = "माफ गर्नुहोस्, अहिले जवाफ दिन सकिनँ।";
        if (res.ok) {
            const data = await res.json();
            answer = data.choices[0].message.content;
        } else {
            // Free Gemini 1.5 Flash (no key needed for low traffic)
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDUMMY`, {
                method:"POST",
                body: JSON.stringify({contents:[{parts:[{text:question}]}]})
            });
            const geminiData = await geminiRes.json();
            answer = geminiData.candidates[0].content.parts[0].text;
        }

        chatBox.lastElementChild.innerHTML = answer.replace(/\n/g, "<br>");
    } catch (e) {
        chatBox.lastElementChild.innerHTML = "नेटवर्क समस्या भयो, फेरि प्रयास गर्नुहोस्।";
    }
}

// Enter key se bhi send ho
userInput.addEventListener("keypress", (e) => { if(e.key === "Enter") sendMessage(); });
