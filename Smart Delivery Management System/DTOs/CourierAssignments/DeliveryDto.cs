namespace Smart_Delivery_Management_System.DTOs.CourierAssignments
{
    public class DeliveryDto
    {
        public int Id { get; set; }

        public string PickupAddress { get; set; }

        public string DropoffAddress { get; set; }

        public string Status { get; set; }
    }
}
