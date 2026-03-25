namespace Smart_Delivery_Management_System.Services.AI
{
    public interface IAIService
    {
        Task<AiAnswer> ProcessManagerRequestAsync(string userMessage);
    }
}
