using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.DTOs.UserDto;
using Smart_Delivery_Management_System.Repositories;
using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _repo;

        public UserController(IUserRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _repo.GetAll();

            var usersDto = users.Select(u => new UserReadDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email
            }).ToList();

            return Ok(usersDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _repo.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserReadDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email
            };

            return Ok(userDto);
        }

        // POST: api/users
        [HttpPost]
        public async Task<IActionResult> Create(UserCreateDto createUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userToCreate = new User
            {
                Email = createUserDto.Email,
                FullName = createUserDto.FullName
                
            };

            await _repo.Add(userToCreate, createUserDto.Password);

            var userReadDto = new UserReadDto
            {
                Id = userToCreate.Id,
                Email = userToCreate.Email,
                FullName = userToCreate.FullName
            };

            return CreatedAtAction(nameof(GetById), new { id = userToCreate.Id }, userReadDto);
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserUpdateDto userUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _repo.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            user.Email = userUpdateDto.Email;
            user.FullName = userUpdateDto.FullName;

            if (!string.IsNullOrEmpty(userUpdateDto.Password))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userUpdateDto.Password);

            await _repo.Update(user);

            var userReadDto = new UserReadDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email
            };

            return Ok(userReadDto);
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _repo.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            //bool hasCourier = await _repo.HasCouriers(id);
            //bool hasDelivery = await _repo.HasDeliveries(id);

            //if (hasCourier || hasDelivery)
            //{
            //    return BadRequest("Cannot delete user with associated couriers or deliveries.");
            //}

            await _repo.Delete(id); // Soft deleting

            return NoContent();
        }

    }
}