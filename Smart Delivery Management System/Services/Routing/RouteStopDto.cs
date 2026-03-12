namespace Smart_Delivery_Management_System.Services.Routing
{
    public class RouteStopDto
    {
        public int Order { get; set; }

        public int DeliveryId { get; set; }

        public string DropoffAddress { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        // Optional:
        // public string CustomerName { get; set; }
        // public double DropoffLatitude { get; set; } 
        // public double DropoffLongitude { get; set; }
    }
}
