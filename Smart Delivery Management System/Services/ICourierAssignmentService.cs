using Smart_Delivery_Management_System.Models;
using System.Threading.Tasks;

namespace Smart_Delivery_Management_System.Services
{
    public interface ICourierAssignmentService
    {
        Task<Result> AssignDeliveriesAsync(
            List<Courier> availableCouriers,
            List<Delivery> pendingDeliveries);
    }
}
