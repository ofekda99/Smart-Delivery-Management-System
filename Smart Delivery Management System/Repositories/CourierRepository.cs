using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.Data;
using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Repositories
{
    public class CourierRepository : ICourierRepository
    {
        private readonly DeliveryDbContext _context;

        public CourierRepository(DeliveryDbContext context)
        {
            _context = context;
        }

        public async Task Add(Courier courier)
        {
            _context.Couriers.Add(courier);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var courier = await GetById(id);
            //_context.Couriers.Remove(courier);
            //await _context.SaveChangesAsync();
            courier.DeletedAt = DateTime.UtcNow;
            _context.Couriers.Update(courier);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Courier>> GetAll()
        {
            return await _context.Couriers.ToListAsync();
        }

        public async Task<Courier> GetById(int id)
        {
            return await _context.Couriers.FindAsync(id);
        }

        public async Task Update(Courier courier)
        {
            _context.Couriers.Update(courier);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasActiveDeliveries(int courierId)
        {
            bool hasActiveDeliveries = await _context.Deliveries
                .AnyAsync(d => d.CourierId == courierId && d.Status != "Delivered");

            return hasActiveDeliveries;
        }

        public async Task<List<Courier>> GetAvailableCouriers()
        {
            return await _context.Couriers.Where(c=> c.IsAvailable).ToListAsync();
        }
    }
}
