namespace Smart_Delivery_Management_System.DTOs.DeliveryDto
{
    public class DeliveryUpdateDto
    {
        public string PickupAddress { get; set; }
        public string DropoffAddress { get; set; }
        public string Status { get; set; }
        public int? CourierId { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }
}
