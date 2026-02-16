using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.Services;
using Smart_Delivery_Management_System.Services.Routing;

namespace Smart_Delivery_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoutePlanningController : ControllerBase
    {
        private readonly IRoutePlanningService _routePlanningService;

        public RoutePlanningController(IRoutePlanningService routePlanningService)
        {
            _routePlanningService = routePlanningService;
        }
        [HttpGet("plan")]
        public async Task<IActionResult> PlanRoutes()
        {
            List<CourierRouteDto> courierRouteDtos = await _routePlanningService.PlanRoutesAsync();

            if (courierRouteDtos == null || courierRouteDtos.Count == 0)
            {
                return NotFound("No routes could be planned or no pending deliveries were found.");
            }

            return Ok(courierRouteDtos);
        }
    }
}
