using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.Repositories;
using System.Text.RegularExpressions;

namespace Smart_Delivery_Management_System.Services.AI
{
    public class AIOperationExecutor : IAIOperationExecutor
    {
        private readonly IDeliveryRepository _deliveryRepo;
        private readonly ICourierRepository _courierRepo;
        private readonly IGeocodingService _geocodingService;

        public AIOperationExecutor(IDeliveryRepository deliveryRepo, ICourierRepository courierRepo, IGeocodingService geocodingService)
        {
            _deliveryRepo = deliveryRepo;
            _courierRepo = courierRepo;
            _geocodingService = geocodingService;
        }

        public async Task<string> ExecuteAsync(string aiResponse)
        {
            // בדיקה אם יש פקודה בטקסט
            if (!aiResponse.Contains("[EXEC_")) return aiResponse;

            try
            {
                if (aiResponse.Contains("[EXEC_DELETE:"))
                    return await HandleDelete(aiResponse);

                if (aiResponse.Contains("[EXEC_CREATE:"))
                    return await HandleCreate(aiResponse);

                if (aiResponse.Contains("[EXEC_ASSIGN:"))
                    return await HandleAssign(aiResponse);

                if (aiResponse.Contains("[EXEC_STATUS:"))
                    return await HandleStatusUpdate(aiResponse);

                return aiResponse;
            }
            catch (Exception ex)
            {
                return $"ה-AI ניסה לבצע פעולה אך אירעה שגיאה: {ex.Message}";
            }
        }

        private async Task<string> HandleDelete(string text)
        {
            var match = Regex.Match(text, @"\[EXEC_DELETE:(\d+)\]");
            if (match.Success)
            {
                int id = int.Parse(match.Groups[1].Value);
                await _deliveryRepo.Delete(id);
                return "בוצע: המשלוח נמחק מהמערכת.";
            }

            return "שגיאה: לא הצלחתי לחלץ מזהה משלוח למחיקה.";
        }
        private async Task<string> HandleCreate(string text)
        {
            // Excepted format: [EXEC_CREATE:כתובת|ID_שליח]
            var createMatch = Regex.Match(text, @"\[EXEC_CREATE:ADDRESS='(.*?)'[,;]\s*COURIER_ID='(\d+)'\]");

            if (createMatch.Success)
            {
                string address = createMatch.Groups[1].Value.Trim();
                int courierId = int.Parse(createMatch.Groups[2].Value);

                // 2. קריאה לשירות ה-Geocoding (בדיוק כמו בקונטרולר)
                // הערה: בשביל הפשטות למצגת, נשתמש באותה כתובת גם לאיסוף וגם למסירה 
                // או שתגדיר כתובת מחסן קבועה כברירת מחדל
                var coords = await _geocodingService.GetCoordinatesAsync(address);

                var newDelivery = new Delivery
                {
                    PickupAddress = "מחסן ראשי - תל אביב", // כתובת ברירת מחדל למקור
                    PickupLatitude = 32.0853,           // קואורדינטות ברירת מחדל
                    PickupLongitude = 34.7818,

                    DropoffAddress = address,
                    DropoffLatitude = coords?.lat ?? 0, // חילוץ מהשירות
                    DropoffLongitude = coords?.lon ?? 0,

                    Status = "Pending",
                    CourierId = courierId > 0 ? courierId : (int?)null,
                    CreatedAt = DateTime.UtcNow
                };

                // 3. עכשיו ה-Add יעבוד כי כל השדות המנדטוריים מלאים!
                await _deliveryRepo.Add(newDelivery);
                return $"בוצע! יצרתי משלוח חדש לכתובת {address}.";
            }
            return "שגיאה: חסרים פרטים ליצירת המשלוח.";
        }
        private async Task<string> HandleAssign(string text)
        {
            // Excepted format: [EXEC_ASSIGN:ID_משלוח:ID_שליח]
            var match = Regex.Match(text, @"\[EXEC_ASSIGN:(\d+):(\d+)\]");
            if (match.Success)
            {
                int deliveryId = int.Parse(match.Groups[1].Value);
                int courierId = int.Parse(match.Groups[2].Value);

                var delivery = await _deliveryRepo.GetById(deliveryId);
                if (delivery != null)
                {
                    delivery.CourierId = courierId;
                    await _deliveryRepo.Update(delivery);
                    return $"בוצע: משלוח {deliveryId} שובץ לשליח {courierId}.";
                }
            }
            return "שגיאה: לא נמצא המשלוח לשיבוץ מחדש.";
        }

        private async Task<string> HandleStatusUpdate(string text)
        {
            // Excepted format: [EXEC_STATUS:ID_משלוח:סטטוס]
            //var match = Regex.Match(text, @"\[EXEC_STATUS:(\d+):(.*??)\]");
            var match = Regex.Match(text, @"\[EXEC_STATUS:(\d+):(.+?)\]");
            if (match.Success)
            {
                int deliveryId = int.Parse(match.Groups[1].Value);
                string newStatus = match.Groups[2].Value;

                var delivery = await _deliveryRepo.GetById(deliveryId);
                if (delivery != null)
                {
                    delivery.Status = newStatus;
                    await _deliveryRepo.Update(delivery);
                    return $"בוצע: סטטוס משלוח {deliveryId} עודכן ל-{newStatus}.";
                }
            }
            return "שגיאה: עדכון הסטטוס נכשל.";
        }
    }
}
