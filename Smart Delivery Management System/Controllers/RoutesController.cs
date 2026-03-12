using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.Services.Routing;

namespace Smart_Delivery_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoutesController : ControllerBase
    {
        private readonly IRoutePlanningService _routePlanningService;

        public RoutesController(IRoutePlanningService routePlanningService)
        {
            _routePlanningService = routePlanningService;
        }

        [HttpGet("courier/{courierId}")]
        public async Task<IActionResult> GetCourierRoute(int courierId)
        {
            var route = await _routePlanningService.GetCourierRouteAsync(courierId);

            if (route == null)
                return NotFound();

            return Ok(route);
        }

    }
}
