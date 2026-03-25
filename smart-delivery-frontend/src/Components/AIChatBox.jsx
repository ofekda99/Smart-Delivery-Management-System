// import { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import { MessageSquare, X, Send, Bot, Loader2, Maximize2 } from 'lucide-react';
// import './AIChatBox.css';

// function AIChatBox({ onDataChange }) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [messages, setMessages] = useState([
//         { text: "שלום! אני העוזר הלוגיסטי שלך. איך אפשר לעזור?", isAi: true }
//     ]);
//     const [input, setInput] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
    
//     // States לגרירה
//     const [position, setPosition] = useState({ x: 30, y: 30 });
//     const [isDragging, setIsDragging] = useState(false);
//     const dragItem = useRef();
//     const dragStartPos = useRef();

//     const messagesEndRef = useRef(null);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(() => {
//         if (isOpen) scrollToBottom();
//     }, [messages, isOpen]);

//     // פונקציות גרירה (Smooth Drag)
//     const handleMouseDown = (e) => {
//         if (e.target.closest('.chat-header') || e.target.closest('.chat-toggle-btn')) {
//             setIsDragging(true);
//             dragStartPos.current = {
//                 x: e.clientX - position.x,
//                 y: window.innerHeight - e.clientY - position.y
//             };
//         }
//     };

//     useEffect(() => {
//         const handleMouseMove = (e) => {
//             if (!isDragging) return;
//             setPosition({
//                 x: e.clientX - dragStartPos.current.x,
//                 y: window.innerHeight - e.clientY - dragStartPos.current.y
//             });
//         };
//         const handleMouseUp = () => setIsDragging(false);

//         if (isDragging) {
//             window.addEventListener('mousemove', handleMouseMove);
//             window.addEventListener('mouseup', handleMouseUp);
//         }
//         return () => {
//             window.removeEventListener('mousemove', handleMouseMove);
//             window.removeEventListener('mouseup', handleMouseUp);
//         };
//     }, [isDragging]);

//     const handleSend = async () => {
//         if (!input.trim() || isLoading) return;

//         const userMsg = input;
//         setMessages(prev => [...prev, { text: userMsg, isAi: false }]);
//         setInput('');
//         setIsLoading(true);

//         try {
//             const response = await axios.post('https://localhost:44333/api/AI/ask', { 
//                 message: userMsg 
//             });

//             // בדיקה שהתשובה הגיעה מהבנקד
//             if (response.data) {
//                 const { reply, actionExecuted } = response.data;
                
//                 setMessages(prev => [...prev, { 
//                     text: reply || "הפעולה בוצעה בהצלחה.", 
//                     isAi: true 
//                 }]);

//                 if (actionExecuted && onDataChange) {
//                     onDataChange(); // מרענן את הטבלה ב-Dashboard
//                 }
//             }
//         } catch (error) {
//             console.error("AI Error:", error);
//             setMessages(prev => [...prev, { text: "שגיאה בתקשורת עם השרת. וודא שהבנקד רץ.", isAi: true }]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div 
//             className="ai-chat-wrapper" 
//             style={{ left: `${position.x}px`, bottom: `${position.y}px` }}
//         >
//             {/* כפתור הבועה הצפה (גם הוא גריר) */}
//             <div className="chat-anchor" onMouseDown={handleMouseDown}>
//                 <button 
//                     onClick={() => setIsOpen(!isOpen)} 
//                     className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
//                 >
//                     {isOpen ? <X size={28} /> : <Bot size={28} />}
//                 </button>
//             </div>

//             {/* חלון הצ'אט המרכזי */}
//             {isOpen && (
//                 <div className="chat-window-container resizable">
//                     <div className="chat-header" onMouseDown={handleMouseDown}>
//                         <div className="header-info">
//                             <div className="online-dot"></div>
//                             <span>עוזר לוגיסטי AI</span>
//                         </div>
//                         <div className="header-actions">
//                              <X size={18} onClick={() => setIsOpen(false)} style={{cursor:'pointer'}} />
//                         </div>
//                     </div>
                    
//                     <div className="chat-messages">
//                         {messages.map((msg, index) => (
//                             <div key={index} className={`message-bubble ${msg.isAi ? 'ai' : 'user'}`}>
//                                 {msg.text}
//                             </div>
//                         ))}
//                         {isLoading && (
//                             <div className="message-bubble ai loading-dots">
//                                 <span>מנתח נתונים</span>
//                                 <Loader2 size={14} className="spin-icon" />
//                             </div>
//                         )}
//                         <div ref={messagesEndRef} />
//                     </div>

//                     <div className="chat-input-area">
//                         <input 
//                             value={input} 
//                             onChange={(e) => setInput(e.target.value)}
//                             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                             placeholder="כתוב פקודה..."
//                         />
//                         <button onClick={handleSend} disabled={isLoading}>
//                             <Send size={18} />
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default AIChatBox;

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, X, Send, Loader2, Sparkles, Trash2, PlusCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './AIChatBox.css';

function AIChatBox({ onDataChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    
    const [position, setPosition] = useState({ x: 30, y: 30 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef();
    const messagesEndRef = useRef(null);

    const quickActions = [
        { label: "מחק משלוח 12", command: "תמחק את משלוח מספר 12", icon: <Trash2 size={14}/> },
        { label: "משלוח לחולון", command: "תיצור משלוח חדש לאילת 15 חולון", icon: <PlusCircle size={14}/> },
        { label: "סיום משלוח 5", command: "תעדכן שמשלוח 5 הגיע ליעד", icon: <CheckCircle size={14}/> }
    ];

    // אפקט הקלדה (Typing Animation)
    // מנגנון הקלדה חסין שגיאות
const runTypingEffect = (fullText) => {
    // הגנה: אם fullText לא הגיע או שהוא לא מחרוזת, אל תמשיך
    if (!fullText || typeof fullText !== 'string') {
        setIsLoading(false);
        return;
    }

    setIsTyping(true);
    let currentIdx = 0;
    
    // הוספת הודעת AI ריקה התחלתית
    setMessages(prev => [...prev, { text: "", isAi: true, isComplete: false }]);

    const interval = setInterval(() => {
        setMessages(prev => {
            // הגנה: וודא שיש הודעות במערך
            if (prev.length === 0) {
                clearInterval(interval);
                setIsTyping(false);
                return prev;
            }

            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            
            // הגנה: וודא שההודעה האחרונה היא אכן הודעת AI
            if (!lastMsg || !lastMsg.isAi) {
                clearInterval(interval);
                setIsTyping(false);
                return prev;
            }

            if (currentIdx <= fullText.length) {
                lastMsg.text = fullText.substring(0, currentIdx);
                currentIdx++;
                return newMsgs;
            } else {
                lastMsg.isComplete = true;
                clearInterval(interval);
                setIsTyping(false);
                return newMsgs;
            }
        });
    }, 25);
};

    // הודעת פתיחה אוטומטית (סעיף 3)
    useEffect(() => {
        if (isOpen && !hasOpened) {
            setTimeout(() => {
                runTypingEffect("היי! אני העוזר הלוגיסטי שלך. ✨ אני יכול ליצור, למחוק או לעדכן משלוחים בשפה חופשית. איך אפשר לעזור?");
                setHasOpened(true);
            }, 600);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async (e, forcedInput = null) => {
    // 1. מניעת פעפוע ורענון (פותר את בעיית הדף הריק)
    if (e && typeof e.preventDefault === 'function') { 
        e.preventDefault(); 
        e.stopPropagation(); 
    }
    
    const textToSend = forcedInput || input;
    if (!textToSend?.trim() || isLoading || isTyping) return;

    setMessages(prev => [...prev, { text: textToSend, isAi: false }]);
    if (!forcedInput) setInput('');
    setIsLoading(true);

    try {
        const response = await axios.post('https://localhost:44333/api/AI/ask', { message: textToSend });
        const { answer, actionExecuted } = response.data;
        // 2. בדיקה קריטית: האם התשובה בפורמט הנכון?
        if (answer) {
        setIsLoading(false);
        
            
            // שליחת הטקסט לאפקט ההקלדה
            runTypingEffect(answer);

            // 3. ריענון הטבלה אם הפעולה בוצעה (actionExecuted: true)
           if (actionExecuted === true) {
                console.log("Action detected from AI object! Refreshing...");
                
                // הפעלת הריענון ב-Dashboard
                if (onDataChange) onDataChange();
                
                // שליחת אירוע גלובלי ליתר ביטחון
                window.dispatchEvent(new Event('refreshData'));
                
                toast.success("המערכת התעדכנה 🚀");
            }
        } else {
            // אם השרת החזיר פורמט לא צפוי
            throw new Error("Invalid response from server");
        }
    } catch (error) {
        console.error("Chat Error:", error);
        setIsLoading(false);
        setMessages(prev => [...prev, { 
            text: "מצטער, הייתה בעיה בתקשורת עם השרת. וודא שהבנקד רץ.", 
            isAi: true, 
            isError: true 
        }]);
    }
};

    const handleMouseDown = (e) => {
        if (e.target.closest('.chat-header')) {
            setIsDragging(true);
            dragStartPos.current = { x: e.clientX - position.x, y: window.innerHeight - e.clientY - position.y };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setPosition({ x: e.clientX - dragStartPos.current.x, y: window.innerHeight - e.clientY - dragStartPos.current.y });
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const getMessageClass = (msg) => {
        if (!msg.isAi) return 'user';
        const txt = msg.text.toLowerCase();
        if (txt.includes('מחק') || txt.includes('בוטל')) return 'ai ai-danger';
        if (txt.includes('יצרתי') || txt.includes('חדש')) return 'ai ai-success';
        return 'ai';
    };

    return (
        <div className="ai-chat-wrapper" style={{ left: `${position.x}px`, bottom: `${position.y}px` }}>
            <button onClick={() => setIsOpen(!isOpen)} className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}>
                {isOpen ? <X size={28} /> : <Bot size={28} />}
            </button>

            {isOpen && (
                <div className="chat-window-container resizable">
                    <div className="chat-header" onMouseDown={handleMouseDown}>
                        <div className="header-info">
                            <div className="pulse-dot"></div>
                            <Sparkles size={16} className="sparkle-icon" />
                            <span>AI Logistics System</span>
                        </div>
                        <div className="system-status">Online</div>
                    </div>
                    
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="empty-state">
                                <div className="bot-icon-container"><Bot size={40} color="#6366f1" /></div>
                                <h3>מערכת AI מוכנה</h3>
                                <p>נסה לבקש פעולה מהירה מהכפתורים למטה</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${getMessageClass(msg)}`}>
                                {msg.text}
                                {msg.isAi && !msg.isComplete && <span className="typing-cursor">|</span>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-bubble ai loading-dots">
                                <Loader2 size={16} className="spin" />
                                <span>חושב...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="quick-actions-area">
                        {quickActions.map((action, index) => (
                            <button key={index} onClick={() => handleSend(action.command)} className="action-chip" disabled={isLoading || isTyping}>
                                {action.icon} {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="chat-input-area">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="איך אוכל לעזור?"
                            disabled={isTyping}
                        />
                        <button onClick={() => handleSend()} className="send-btn" disabled={isLoading || isTyping || !input.trim()}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIChatBox;