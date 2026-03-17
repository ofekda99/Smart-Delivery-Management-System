using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.JWT
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
