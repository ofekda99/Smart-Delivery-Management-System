using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.Data;
using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Repositories
{
    public class DeliveryRepository : IDeliveryRepository
    {
        private readonly DeliveryDbContext _context;

        public DeliveryRepository(DeliveryDbContext context)
        {
            _context = context;
        }

        public async Task Add(Delivery delivery)
        {
            _context.Deliveries.Add(delivery);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var delivery = await GetById(id);
            _context.Deliveries.Remove(delivery);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Delivery>> GetAll()
        {
            return await _context.Deliveries.ToListAsync();
        }

        public async Task<Delivery> GetById(int id)
        {
            return await _context.Deliveries.FindAsync(id);
        }

        public async Task Update(Delivery delivery)
        {
            _context.Deliveries.Update(delivery);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Delivery>> GetPendingDeliveries()
        {
            return await _context.Deliveries.Where(d => d.Status == "Pending").ToListAsync();
        }

        public async Task<int> Save()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task UpdateDeliveries(List<Delivery> deliveries)
        {
            foreach (var delivery in deliveries)
            {
                _context.Entry(delivery).State = EntityState.Modified;
            }
            await _context.SaveChangesAsync();
        }
    }
}
