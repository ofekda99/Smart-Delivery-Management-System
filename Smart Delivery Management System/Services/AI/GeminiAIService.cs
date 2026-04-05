
using Microsoft.Identity.Client;
using Mscc.GenerativeAI;
using Mscc.GenerativeAI.Types;
using Smart_Delivery_Management_System.Repositories;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace Smart_Delivery_Management_System.Services.AI
{
    public class GeminiAIService : IAIService
    {
        private readonly string _geminiApiKey;
        private readonly IDeliveryRepository _deliveryRepo;
        private readonly ICourierRepository _courierRepo;
        private readonly IAIOperationExecutor _aiExecutor;
        private readonly string _groqApiKey;
        private static int _currentKeyIndex = 0;

        private readonly HttpClient _httpClient;

        public GeminiAIService(IConfiguration config, IDeliveryRepository deliveryRepo, ICourierRepository courierRepository, IAIOperationExecutor executor)
        {
            _geminiApiKey = config["Gemini:ApiKey"];
            _groqApiKey = config["Groq:ApiKey"];
            _deliveryRepo = deliveryRepo;
            _courierRepo = courierRepository;
            _httpClient = new HttpClient();
            _aiExecutor = executor;
        }

        public async Task<AiAnswer> ProcessManagerRequestAsync(string userMessage)
        {
            // 1. שליפת נתונים חיים מה-DB כדי לתת ל-AI "הקשר" (Context)
            var deliveries = await _deliveryRepo.GetAll();
            var couriers = await _courierRepo.GetAll();

            // בניית תמונת מצב טקסטואלית
            //var contextBuilder = new StringBuilder();
            //contextBuilder.AppendLine("נתוני מערכת נוכחיים:");
            //contextBuilder.AppendLine("משלוחים: " + JsonSerializer.Serialize(deliveries.Select(d => new { d.Id, d.Status, d.DropoffAddress, d.CourierId })));
            //contextBuilder.AppendLine("שליחים: " + JsonSerializer.Serialize(couriers.Select(c => new { c.Id, c.Name, dCount = deliveries.Count(d => d.CourierId == c.Id) })));
            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine("### נתוני מערכת נוכחיים (נא להשתמש בשמות המדויקים):");

            contextBuilder.AppendLine("--- רשימת משלוחים ---");
            foreach (var d in deliveries)
            {
                contextBuilder.AppendLine($"- מזהה: {d.Id}, סטטוס: {d.Status}, כתובת: {d.DropoffAddress}, שליח משויך (מזהה): {d.CourierId}");
            }

            contextBuilder.AppendLine("\n--- רשימת שליחים ---");
            foreach (var c in couriers)
            {
                var count = deliveries.Count(d => d.CourierId == c.Id);
                contextBuilder.AppendLine($"- שם השליח: {c.Name}, מזהה שליח: {c.Id}, כמות משלוחים בטיפול: {count}");
            }
            // 2. הנחיות ל-AI (System Prompt)
            //string systemPrompt = @"אתה עוזר לוגיסטי חכם. השתמש בנתונים שסופקו כדי לענות.
            //- אם המשתמש רוצה למחוק משלוח, ענה בפורמט: [EXEC_DELETE:ID].
            //- אם המשתמש שואל שאלות ניתוח (כמו 'מי הכי עמוס'), חשב לפי הנתונים וענה בעברית.
            //- תמיד ענה בנימוס ובקצרה.";

            string systemInstructions = @"אתה עוזר לוגיסטי חכם במערכת ניהול משלוחים. 
לרשותך נתוני JSON של משלוחים ושליחים. 
עליך לענות על שאלות ולבצע פעולות לפי הפורמטים הבאים בלבד:

1. למחיקת משלוח: השתמש ב- [EXEC_DELETE:ID]
2. לשיבוץ משלוח לשליח: השתמש ב- [EXEC_ASSIGN:DeliveryID:CourierID]
3. לעדכון סטטוס משלוח: השתמש ב- [EXEC_STATUS:DeliveryID:StatusName] (סטטוסים: Pending, InProgress, Delivered)
4. ליצירת משלוח חדש: השתמש ב- [EXEC_CREATE:Address|CourierID] (אם לא צוין שליח, שים 0 ב-ID).1. יצירת משלוח: [EXEC_CREATE:ADDRESS='הכתובת המלאה';COURIER_ID='מזהה_שליח']"" +
""   - חובה להעתיק את כל הכתובת שסיפק המשתמש לתוך ADDRESS."" +
""   - אם לא צוין שליח, שים 0 ב-COURIER_ID.""
לפני ביצירת פקודת [EXEC_CREATE], וודא ששם העיר והרחוב כתובים נכון. אם המשתמש כתב 'חולן', תקן זאת ל-'חולון'. אם המשתמש כתב 'תא', תקן ל-'תל אביב'. שלח ב-ADDRESS רק כתובות תקינות וקיימות בישראל.

5. עדכון סטטוס משלוח: השתמש בפורמט [EXEC_STATUS:DeliveryID:NewStatus].
הסטטוסים המותרים הם: Pending (ממתין), InProgress (בטיפול), Delivered (נמסר).
דוגמה: אם המשתמש אומר 'רני סיים את משלוח 5', ענה: '[EXEC_STATUS:5:Delivered] עדכנתי את הסטטוס של משלוח 5 לנמסר

הנחיות חשובות:
אל תסביר את הלוגיקה שלך ואל תשאל שאלות חזרה. תן תשובה ישירה וממוקדת. אם שואלים מי פנוי, תענה מיד מי השליח עם הכי פחות משלוחים לפי הנתונים שקיבלת. אל תכתוב תווים כמו \u05E0 (יוניקוד), תכתוב בעברית נקייה
- אם חסר מידע ליצירת משלוח (כמו כתובת), אל תבצע EXEC_CREATE אלא שאל את המשתמש.
- תמיד תן תשובה מנומסת בעברית שמסבירה מה עשית, למשל: ""בוצע, מחקתי את משלוח 5"".
- אל תמציא נתונים שלא קיימים ב-JSON שסופק לך.";

            string fullPrompt = $"{systemInstructions}\n\n{contextBuilder}\n\nUser Message: {userMessage}";

            // 3. קריאה ל-API של Gemini
            //var aiRawResponse = await CallGroqApi(fullPrompt);
            var aiRawResponse = await GetSmartAiResponse(fullPrompt);
            bool hasActionExecuted = aiRawResponse.Contains("[EXEC", StringComparison.OrdinalIgnoreCase);
            string answer = await _aiExecutor.ExecuteAsync(aiRawResponse);
            // 4. עיבוד התשובה וביצוע פעולות במידת הצורך
            var aiAnswer = new AiAnswer
            {
                Answer = answer,
                HasActionExecuted = hasActionExecuted
            };

            return aiAnswer;
        }

        private async Task<string> CallGeminiApi(string prompt)
        {
            // var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
            var url = $"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={_geminiApiKey.Trim()}";
            //var url = $"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key={_apiKey.Trim()}";
            // var url = $"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key={_apiKey.Trim()}";
            var requestBody = new
            {
                contents = new[] {
                    new { role = "user", parts = new[] { new { text = prompt } } }
                }
            };

            var jsonRequest = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return $"שגיאת API: {response.StatusCode}. פרטים: {responseString}";
            }

            using var doc = JsonDocument.Parse(responseString);
            try
            {
                // שימוש ב-TryGetProperty מונע קריסה אם המפתח חסר
                if (doc.RootElement.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    return candidates[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();
                }
                return "ה-AI לא החזיר תשובה תקינה (ייתכן בגלל סינון תוכן).";
            }
            catch (Exception ex)
            {
                return $"שגיאה בניתוח תשובת ה-AI: {ex.Message}";
            }
        }

        private async Task<string> CallGroqApi(string prompt)
        {
            var apiKey = _groqApiKey;
            var url = "https://api.groq.com/openai/v1/chat/completions";

            var requestBody = new
            {
                model = "llama-3.3-70b-versatile",
                messages = new[] {
            new { role = "user", content = prompt }
        },
                // --- כאן אתה מוסיף את השורה הזו ---
                temperature = 0,
                // ----------------------------------
                max_tokens = 500 // אופציונלי: מגביל אותו שלא יחפור תשובות ארוכות מדי
            };

            var jsonRequest = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _httpClient.PostAsync(url, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == (HttpStatusCode)429) // Too Many Requests
                return null;

            using var doc = JsonDocument.Parse(responseString);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();
        }

        public async Task<string> GetSmartAiResponse(string prompt)
        {

            // 1. ניסיון ראשון: Groq (מהיר וחסכוני)
            var a = await CallGroqApi(prompt);

            if (a == null)
            {
                a = await CallGeminiApi(prompt);
            }

            // 2. נתיב גיבוי: Gemini (אם Groq חסם אותנו)
            Console.WriteLine("Groq is limited, switching to Gemini...");

            return a;

        }

        //public async Task<string> CallGroqWithRotation(string prompt)
        //{
        //    int attempts = 0;

        //    // הוא ינסה כמספר המפתחות שיש לך
        //    while (attempts < _apiKeys.Length)
        //    {
        //        string currentKey = _apiKeys[_currentKeyIndex];

        //        try
        //        {
        //            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        //            request.Headers.Add("Authorization", $"Bearer {currentKey}");

        //            // הכנת ה-Body (תוודא שזה תואם למה שיש לך היום)
        //            var body = new
        //            {
        //                model = "llama-3.3-70b-versatile",
        //                messages = new[] {
        //    new { role = "user", content = prompt }
        //},
        //                // --- כאן אתה מוסיף את השורה הזו ---
        //                temperature = 0,
        //                // ----------------------------------
        //                max_tokens = 500 // אופציונלי: מגביל אותו שלא יחפור תשובות ארוכות מדי
        //            };
        //            request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        //            var response = await _httpClient.SendAsync(request);
        //            var responseString = await response.Content.ReadAsStringAsync();

        //            if (response.StatusCode == (HttpStatusCode)429) // Too Many Requests
        //            {
        //                Console.WriteLine($"Key index {_currentKeyIndex} is rate-limited. Switching...");
        //                RotateKey();
        //                attempts++;
        //                continue;
        //            }

        //            using var doc = JsonDocument.Parse(responseString);
        //            return doc.RootElement
        //                .GetProperty("choices")[0]
        //                .GetProperty("message")
        //                .GetProperty("content")
        //                .GetString();
        //        }
        //        catch (Exception ex)
        //        {
        //            Console.WriteLine($"Error with key index {_currentKeyIndex}: {ex.Message}");
        //            RotateKey();
        //            attempts++;
        //        }
        //    }

        //    //return "כל המפתחות חסומים כרגע. נסה שוב בעוד דקה.";
        //    return null;
        //}

        //private void RotateKey()
        //{
        //    _currentKeyIndex = (_currentKeyIndex + 1) % _apiKeys.Length;
        //}

        //private async Task<string> HandleAIResponse(string aiText)
        //{
        //    // בדיקת פקודת מחיקה
        //    if (aiText.Contains("[EXEC_DELETE:"))
        //    {
        //        int startIndex = aiText.IndexOf("[EXEC_DELETE:") + "[EXEC_DELETE:".Length;
        //        int endIndex = aiText.IndexOf("]", startIndex);
        //        string idStr = aiText.Substring(startIndex, endIndex - startIndex);

        //        if (int.TryParse(idStr, out int id))
        //        {
        //            await _deliveryRepo.Delete(id);
        //            return $"בוצע. מחקתי את משלוח מספר {id} מהמערכת כפי שביקשת.";
        //        }
        //    }

        //    return aiText; // החזרת תשובה טקסטואלית רגילה
        //}
    }
}
