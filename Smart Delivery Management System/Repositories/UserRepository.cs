using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.Data;
using Smart_Delivery_Management_System.Models;
using System.Diagnostics.Metrics;

namespace Smart_Delivery_Management_System.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DeliveryDbContext _context;

        public UserRepository(DeliveryDbContext context)
        {
            _context = context;
        }

        public async Task Add(User user, string plainPassword)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var user = await GetById(id);
            //_context.Users.Remove(user);
            //await _context.SaveChangesAsync();

            user.DeletedAt = DateTime.UtcNow;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<List<User>> GetAll()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetById(int id)
        {
            return await _context.Users.FindAsync(id);
        }
        
        public async Task Update(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
        // Currently useless because soft delete replace this methods
        public async Task<bool> HasCouriers(int userId)
        {
            var couriers = await _context.Couriers.AnyAsync(c => c.UserId == userId);

            return couriers;
        }
        // Currently useless because soft delete replace this methods
        public async Task<bool> HasDeliveries(int userId)
        {
            var delivers = await _context.Deliveries.AnyAsync(d => d.Courier.UserId == userId);

            return delivers;
        }

        public async Task<User> GetByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.DeletedAt == null);
        }
    }
}
