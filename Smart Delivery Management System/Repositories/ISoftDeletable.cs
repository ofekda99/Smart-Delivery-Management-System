namespace Smart_Delivery_Management_System.Repositories
{
    public interface ISoftDeletable
    {
        public DateTime? DeletedAt { get; set; }
    }
}
