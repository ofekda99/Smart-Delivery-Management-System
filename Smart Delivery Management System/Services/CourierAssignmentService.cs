using Microsoft.Extensions.Options;
using Smart_Delivery_Management_System.DTOs.CourierAssignments;
using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.Repositories;
using Smart_Delivery_Management_System.Services;

namespace Smart_Delivery_Management_System.Services
{
    public class CourierAssignmentService : ICourierAssignmentService
    {
        private readonly IDeliveryRepository _repo;

        public CourierAssignmentService(IDeliveryRepository repo)
        {
            _repo = repo;
        }
        public async Task<Result> AssignDeliveriesAsync(
            List<Courier> availableCouriers,
            List<Delivery> pendingDeliveries)
        {
            // Implements the assigment based on RoundRobin Algorithm
            var courierAssigments = new List<CourierAssignmentDto>();
            int courierIndex = 0;

            if (!availableCouriers.Any())
            {
                return Result.Fail("Assignment failed: No available couriers were found");
            }

            if (!pendingDeliveries.Any())
            {
                return Result.Success(courierAssigments);
            }

            foreach (var courier in availableCouriers)
            {
                courierAssigments.Add(new CourierAssignmentDto
                {
                    CourierId = courier.Id,
                    CourierName = courier.Name,
                    Deliveries = new List<Delivery>()
                });
            }

            foreach (var delivery in pendingDeliveries)
            {
                var courier = availableCouriers[courierIndex];
                delivery.CourierId = courier.Id;
                delivery.Status = "Assigned";

                var courierDto = courierAssigments.First(c=> c.CourierId == courier.Id);
                courierDto.Deliveries.Add(delivery);
                courierIndex = (courierIndex + 1) % availableCouriers.Count;
            }

            await _repo.Save();

            return Result.Success(courierAssigments);
        }
    }
}
