document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const contentData = {
        jokes: {
            general: [
                'مرة واحد صعيدي فتح محل بقالة، كتب على الباب "البقالة الذكية"، كل ما حد يسأله على حاجة يقوله "ابحث في جوجل".',
                'دكتور أسنان بيقول للمريض: "للأسف سنانك محتاجة تقويم"، المريض قاله: "هجري ولا ميلادي يا دكتور؟"',
                'واحد رجع في كلامه، خبط اللي وراه.'
            ],
            short: [
                'ليه القطر بيقف في المحطة؟ عشان مش بيعرف يقعد.',
                'مرة نملة شافت نفسها في المراية، قالت "يخرب بيت الوسط ده".'
            ]
        },
        questions: {
            deep: [
                'لو كان بإمكانك السفر عبر الزمن، هل ستذهب إلى الماضي أم المستقبل؟ ولماذا؟',
                'ما هي أهم نصيحة تلقيتها في حياتك؟'
            ],
            fun: [
                'ما هي القوة الخارقة التي تتمنى أن تمتلكها؟',
                'إذا فزت باليانصيب غدًا، ما هو أول شيء ستفعله؟'
            ]
        },
        challenges: {
            easy: ['قل "أهلاً" لشخص غريب اليوم.', 'اكتب ٣ أشياء تشعر بالامتنان لوجودها في حياتك.'],
            fun: ['حاول تقليد مشية البطريق لمدة دقيقة.', 'ارسم حيوانك المفضل وأنت مغمض العينين.'],
            hard: ['تجنب استخدام هاتفك لمدة ساعتين متواصلتين.', 'اكتب قصة قصيرة من ٥٠٠ كلمة.']
        }
    };

    // --- DOM ELEMENTS ---
    const specialContentBtn = document.getElementById('special-content-btn');
    const modal = document.getElementById('content-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messageArea = document.getElementById('message-area');
    const modalSendBtn = document.getElementById('modal-send-btn');
    const modalContentText = document.getElementById('modal-content-text');

    // --- MODAL LOGIC ---
    specialContentBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Logic for categories inside the modal
    const modalMainCatBtns = modal.querySelectorAll('.modal-category-btn');
    let currentModalCategory = 'challenges'; // Default
    let currentModalSubCategory = 'easy'; // Default

    function updateModalContent() {
        const contentArray = contentData[currentModalCategory][currentModalSubCategory];
        const randomIndex = Math.floor(Math.random() * contentArray.length);
        modalContentText.textContent = contentArray[randomIndex];
    }

    modalMainCatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentModalCategory = btn.dataset.category;
            modalMainCatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // For simplicity, we'll just pick the first sub-category
            currentModalSubCategory = Object.keys(contentData[currentModalCategory])[0];
            updateModalContent();
        });
    });

    // --- SENDING LOGIC ---
    function createMessageElement(text, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        
        const p = document.createElement('p');
        p.textContent = text;
        
        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        const now = new Date();
        timestamp.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

        messageElement.appendChild(p);
        messageElement.appendChild(timestamp);
        
        return messageElement;
    }

    // Send regular message
    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            const messageEl = createMessageElement(text, 'sent');
            messageArea.appendChild(messageEl);
            messageInput.value = '';
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    });
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    // Send special content from modal
    modalSendBtn.addEventListener('click', () => {
        const text = modalContentText.textContent;
        if (text && text !== 'اختر فئة لعرض المحتوى') {
            const messageEl = createMessageElement(text, 'sent');
            messageArea.appendChild(messageEl);
            messageArea.scrollTop = messageArea.scrollHeight;
            modal.style.display = 'none';
        }
    });

    // Initial content for modal
    updateModalContent();
});
