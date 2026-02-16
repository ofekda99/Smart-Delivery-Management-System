namespace Smart_Delivery_Management_System.Models
{
    public class Delivery
    {
        public int Id { get; set; }

        public string PickupAddress { get; set; }

        public string DropoffAddress { get; set; }

        public double PickupLatitude { get; set; }

        public double PickupLongitude { get; set; }

        public double DropoffLatitude { get; set; }
        public double DropoffLongitude { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? DeliveredAt { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Assigned, InProgress, Delivered

        // קשר לשליח
        public int? CourierId { get; set; } // Nullable because delivery may be unassigned
        public Courier Courier { get; set; }

        // סדר העצירה במסלול של השליח (1, 2, 3...)
        public int? RouteOrder { get; set; }
    }
}
