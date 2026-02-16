using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Repositories
{
    public interface IDeliveryRepository
    {
        Task<List<Delivery>> GetAll();

        Task<Delivery> GetById(int id);

        Task Add(Delivery delivery);

        Task Update(Delivery delivery);

        Task Delete(int id);

        Task<int> Save();

        Task<List<Delivery>> GetPendingDeliveries();

        Task UpdateDeliveries(List<Delivery> deliveries);
    }
}
