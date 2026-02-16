using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Repositories
{
    public interface ICourierRepository
    {
        Task<List<Courier>> GetAll();

        Task<Courier> GetById(int id);

        Task Add(Courier courier);

        Task Update(Courier courier);

        Task Delete(int id);

        Task<bool> HasActiveDeliveries(int deliveryId);

        Task<List<Courier>> GetAvailableCouriers();
    }
}
