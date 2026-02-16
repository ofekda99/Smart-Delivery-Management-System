using Microsoft.Extensions.Options;
using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.Repositories;
using Smart_Delivery_Management_System.Services.Routing;
using System.Runtime;

namespace Smart_Delivery_Management_System.Services
{
    public class RoutePlanningService : IRoutePlanningService
    {
        private readonly ICourierAssignmentService _courierAssignmentService;
        private readonly IRouteOptimizationService _routeOptimizationService;
        private readonly ICourierRepository _courierRepo;
        private readonly IDeliveryRepository _deliveryRepo;
        private readonly DeliverySetting _settings;

        public RoutePlanningService(ICourierAssignmentService courierAssignmentService,
                                    ICourierRepository courierRepo,
                                    IDeliveryRepository deliveryRepo,
                                    IRouteOptimizationService routeOptimizationService,
                                    IOptions<DeliverySetting> settings)
        {
            _courierAssignmentService = courierAssignmentService;
            _deliveryRepo = deliveryRepo;
            _courierRepo = courierRepo;
            _routeOptimizationService = routeOptimizationService;
            _settings = settings.Value;
        }

        public async Task<List<CourierRouteDto>> PlanRoutesAsync()
        {
            var availableCouriers = await _courierRepo.GetAvailableCouriers();
            var pendingDeliveries = await _deliveryRepo.GetPendingDeliveries();

            var assignmentsDeliveris = await _courierAssignmentService.
                AssignDeliveriesAsync(availableCouriers, pendingDeliveries);

            var result = new List<CourierRouteDto>();
            var allDeliveriesToUpdate = new List<Delivery>();

            // build a route foreach courier
            foreach (var courierAssignment in assignmentsDeliveris.Assignments)
            {
                var courierModel = courierAssignment.CourierId;
                var assignedDeliveries = courierAssignment.Deliveries;

                var optimizedDeliveries =
                    _routeOptimizationService.OptimizeRouteForCourier(
                        assignedDeliveries,
                        _settings);

                var routeStops = new List<RouteStopDto>();
                int order = 1;

                foreach (var delivery in optimizedDeliveries)
                {
                    delivery.RouteOrder = order++;
                    allDeliveriesToUpdate.Add(delivery);

                    // Create RouteStopDto
                    routeStops.Add(new RouteStopDto
                    {
                        DeliveryId = delivery.Id,
                        DropoffAddress = delivery.DropoffAddress,
                        Order = delivery.RouteOrder.Value 
                    });
                }

                // Add Dto's to result
                result.Add(new CourierRouteDto
                {
                    CourierId = courierAssignment.CourierId,
                    CourierName = courierAssignment.CourierName,
                    Stops = routeStops
                });
            }
            await _deliveryRepo.UpdateDeliveries(allDeliveriesToUpdate);

            return result;
        }

    }
}
