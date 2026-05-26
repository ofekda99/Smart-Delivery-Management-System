using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.Data;
using Smart_Delivery_Management_System.DTOs.UserDto;
using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly DeliveryDbContext _context;
        public AccountController(DeliveryDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserCreateDto dto)
        {

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("האימייל כבר קיים במערכת");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                // TODO: hash password with BCrypt before storing in production
                PasswordHash = dto.Password,
                Role = "Courier"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "נרשמת בהצלחה" });
        }

    }
}
