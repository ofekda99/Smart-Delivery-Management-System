namespace Smart_Delivery_Management_System.DTOs.DeliveryDto
{
    public class DeliveryReadDto
    {
        public int Id { get; set; }
        public string PickupAddress { get; set; }
        public string DropoffAddress { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public string Status { get; set; }
        public int? CourierId { get; set; }  // Nullable
    }
}
