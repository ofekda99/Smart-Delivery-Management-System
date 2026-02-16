namespace Smart_Delivery_Management_System.DTOs.CourierDto
{
    public class CourierReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsAvailable { get; set; }
        public int UserId { get; set; }
    }
}
