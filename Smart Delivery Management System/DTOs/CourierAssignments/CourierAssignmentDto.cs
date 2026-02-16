using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.DTOs.CourierAssignments
    
{
    public class CourierAssignmentDto
    {
        public int CourierId {  get; set; }
        public string CourierName {  get; set; }
        public List<Delivery> Deliveries {  get; set; }
    }
}
