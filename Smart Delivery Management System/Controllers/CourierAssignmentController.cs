using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.Repositories;
using Smart_Delivery_Management_System.Services;


namespace Smart_Delivery_Management_System.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class CourierAssignmentController : ControllerBase
    {
        private readonly ICourierAssignmentService _courierAssignmentService;
        private readonly IDeliveryRepository _deliveryRepo;
        private readonly ICourierRepository _courierRepo;
        public CourierAssignmentController(ICourierAssignmentService courierAssignmentService,
                                           IDeliveryRepository deliveryRepo,
                                           ICourierRepository courierRepo)
        {
            _courierAssignmentService = courierAssignmentService;
            _deliveryRepo = deliveryRepo;
            _courierRepo = courierRepo;
        }

        [HttpPost("assignments")]
        public async Task<IActionResult> AssignDeliveriesToCouriers()
        {
            List<Delivery> pendingDeliveries = await _deliveryRepo.GetPendingDeliveries();
            List<Courier> availableCouriers = await _courierRepo.GetAvailableCouriers();

            Result result = await _courierAssignmentService.AssignDeliveriesAsync(availableCouriers,
                pendingDeliveries);

            if (result.IsSuccess)
            {
                return Ok(result.Assignments);
            }
            else
            {
                return BadRequest(result.ErrorMsg);
            }
        }
    }
}
