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
            var courierAssigments = new List<CourierAssignmentDto>();

            if (!availableCouriers.Any())
                return Result.Fail("Assignment failed: No available couriers were found");

            if (!pendingDeliveries.Any())
                return Result.Success(courierAssigments);

            // polar sweep center point (Holon)

            double centerLat = 32.015;
            double centerLon = 34.787;

            // Polar Sweep: sort deliveries by angle around center point
            var sortedDeliveries = pendingDeliveries
                .OrderBy(d => Math.Atan2(d.DropoffLatitude - centerLat, d.DropoffLongitude - centerLon))
                .ToList();


            foreach (var courier in availableCouriers)
            {
                courierAssigments.Add(new CourierAssignmentDto
                {
                    CourierId = courier.Id,
                    CourierName = courier.Name,
                    Deliveries = new List<Delivery>()
                });
            }

            // partition sorted deliveries into batches, one per courier
            int total = sortedDeliveries.Count;
            int n = availableCouriers.Count;


            int batchSize = (int)Math.Ceiling((double)total / n);

            for (int i = 0; i < n; i++)
            {
                var courierDto = courierAssigments[i];


                var courierBatch = sortedDeliveries
                    .Skip(i * batchSize)
                    .Take(batchSize)
                    .ToList();

                foreach (var delivery in courierBatch)
                {
                    delivery.CourierId = courierDto.CourierId;
                    delivery.Status = "Assigned";
                    courierDto.Deliveries.Add(delivery);
                }
            }

            await _repo.Save();
            return Result.Success(courierAssigments);
        }
    }
}
