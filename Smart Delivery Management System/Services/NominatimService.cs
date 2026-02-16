using Smart_Delivery_Management_System.DTOs;

namespace Smart_Delivery_Management_System.Services
{
    public class NominatimService : IGeocodingService
    {
        private readonly HttpClient _httpClient;

        public NominatimService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "SmartDeliverySystem-StudentProject");
        }

        public async Task<(double lat, double lon)?> GetCoordinatesAsync(string address)
        {
            try
            {
                var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";

                var results = await _httpClient.GetFromJsonAsync<List<NominatimResponseDto>>(url);

                if (results != null && results.Count > 0)
                {
                    var firstResult = results[0];

                    if (double.TryParse(firstResult.Lat, out double lat) &&
                        double.TryParse(firstResult.Lon, out double lon))
                    {
                        return (lat, lon);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Geocoding Error: {ex.Message}");
            }

            return null;
        }
    }
}