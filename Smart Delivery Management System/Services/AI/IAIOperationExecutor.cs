namespace Smart_Delivery_Management_System.Services.AI
{
    public interface IAIOperationExecutor
    {
        Task<string> ExecuteAsync(string aiResponse);
    }
}