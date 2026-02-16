using Smart_Delivery_Management_System.Repositories;

namespace Smart_Delivery_Management_System.Models
{
    public class Courier : ISoftDeletable
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string PhoneNumber { get; set; }

        public bool IsAvailable { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        // connection to deliveries
        public ICollection<Delivery> Deliveries { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}