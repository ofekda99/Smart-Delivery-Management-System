using Smart_Delivery_Management_System.Services.Routing;

namespace Smart_Delivery_Management_System.Services
{
    public class CourierRouteDto
    {
        public int CourierId { get; set; }
        public string CourierName { get; set; }

        // הרשימה המסודרת של העצירות במסלול
        public List<RouteStopDto> Stops { get; set; }

    }
}
