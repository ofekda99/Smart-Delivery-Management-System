using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Services.Routing
{
    public interface IRouteOptimizationService
    {
        public List<Delivery> OptimizeRouteForCourier(List<Delivery> assignedDeliveries,
                                                      DeliverySetting settings);
    }
}
