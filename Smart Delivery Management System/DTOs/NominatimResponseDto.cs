using System.Text.Json.Serialization;

namespace Smart_Delivery_Management_System.DTOs
{
    public class NominatimResponseDto
    {
        [JsonPropertyName("lat")]
        public string Lat { get; set; }

        [JsonPropertyName("lon")]
        public string Lon { get; set; }

        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; }
    }
}
