using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.Services;

namespace Smart_Delivery_Management_System.Controllers
{
    public class GeocodingController : Controller
    {
        private readonly IGeocodingService _geocodingService;

        public GeocodingController(IGeocodingService geocodingService)
        {
            _geocodingService = geocodingService;
        }

        [HttpGet("coordinates")]
        public async Task<IActionResult> GetCoordinates([FromQuery] string address)
        {
            if (string.IsNullOrWhiteSpace(address))
                return BadRequest("Address is required");

            var result = await _geocodingService.GetCoordinatesAsync(address);

            if (result == null)
                return NotFound("Address not found");

            return Ok(new
            {
                Latitude = result.Value.lat,
                Longitude = result.Value.lon
            });
        }
    }
}
