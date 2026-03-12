using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetAll();

        Task<User> GetById(int id);

        Task Add(User user, string plainPassword);

        Task Update(User user);

        Task Delete(int id);

        // שיטת עזר לבדיקה לפני מחיקה
        Task<bool> HasCouriers(int userId);
        Task<bool> HasDeliveries(int userId);

        Task<User> GetByEmail(string email);

    }
}
