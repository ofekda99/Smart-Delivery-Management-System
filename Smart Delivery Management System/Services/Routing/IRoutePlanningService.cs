namespace Smart_Delivery_Management_System.Services.Routing
{
    public interface IRoutePlanningService
    {
        public Task<List<CourierRouteDto>> PlanRoutesAsync();

        Task<CourierRouteDto?> GetCourierRouteAsync(int courierId);
    }
}
