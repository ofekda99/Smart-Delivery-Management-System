using Smart_Delivery_Management_System.Repositories;

namespace Smart_Delivery_Management_System.Models
{
    public class User : ISoftDeletable
    {
        public int Id { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string PasswordHash { get; set; }

        public string Role { get; set; } = "User"; // Admin, Dispatcher, Courier
        public DateTime? DeletedAt { get; set; }
    }
}
