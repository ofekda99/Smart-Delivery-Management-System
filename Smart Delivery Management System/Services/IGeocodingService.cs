namespace Smart_Delivery_Management_System.Services
{
    public interface IGeocodingService
    {
        Task<(double lat, double lon)?> GetCoordinatesAsync(string address);
    }
}
