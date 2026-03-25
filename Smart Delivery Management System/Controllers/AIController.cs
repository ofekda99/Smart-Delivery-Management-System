using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.Services.AI;
using System.Text.Json;

namespace Smart_Delivery_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;

        public AIController(IAIService aiService)
        {
            _aiService = aiService;
        }

        public class ChatRequest
        {
            public string Message { get; set; }
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Message))
                {
                    return BadRequest(new { answer = "נא להזין הודעה." });
                }

                // הפעלת ה-Service שבנינו
                var aiResponse = await _aiService.ProcessManagerRequestAsync(request.Message);
               // var HasActionExecuted = aiResponse.Contains("[EXEC", StringComparison.OrdinalIgnoreCase);

                return Ok(new { answer = aiResponse.Answer, actionExecuted = aiResponse.HasActionExecuted });
            }
            catch (Exception ex)
            {
                // במקרה של שגיאה (למשל API Key לא תקין או בעיית רשת)
                return StatusCode(500, new { error = "שגיאה בתקשורת עם ה-AI", details = ex.Message });
            }
        }
    }
}
