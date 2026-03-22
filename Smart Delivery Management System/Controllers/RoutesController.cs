using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.Repositories;
using Smart_Delivery_Management_System.Services.Routing;

namespace Smart_Delivery_Management_System.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RoutesController : ControllerBase
    {
        private readonly IRoutePlanningService _routePlanningService;
        private readonly ICourierRepository _courierRepo;

        public RoutesController(IRoutePlanningService routePlanningService, ICourierRepository courierRepo)
        {
            _routePlanningService = routePlanningService;
            _courierRepo = courierRepo;
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("courier/{courierId}")]
        public async Task<IActionResult> GetCourierRoute(int courierId)
        {
            var route = await _routePlanningService.GetCourierRouteAsync(courierId);

            if (route == null)
                return NotFound();

            return Ok(route);
        }

        [HttpGet("courier/my-route")]
        public async Task<IActionResult> GetMyRoute()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("משתמש לא מזוהה");

            var courier = await _courierRepo.GetCourier(userId);

            if (courier == null)
                return NotFound("לא נמצא שליח עם המשתמש הזה");

            var route = await _routePlanningService.GetCourierRouteAsync(courier.Id);

            if (route == null)
                return NotFound("לא נמצא מסלול פעיל לשליח זה");

            return Ok(route);
        }

    }
}
