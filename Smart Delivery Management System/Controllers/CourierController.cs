using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.DTOs.CourierDto;
using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.Repositories;

namespace Smart_Delivery_Management_System.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class CourierController : ControllerBase
    {
        private readonly ICourierRepository _repo;

        public CourierController(ICourierRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var couriers = await _repo.GetAll();
            var couriersDto = couriers.Select(c => new CourierReadDto
            {
                Id = c.Id,
                Name = c.Name,
                PhoneNumber = c.PhoneNumber,
                IsAvailable = c.IsAvailable
            }).ToList();

            return Ok(couriersDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var courier = await _repo.GetById(id);

            if (courier == null)
            {
                return NotFound();
            }

            var courierDto = new CourierReadDto
            {
                Id = courier.Id,
                Name = courier.Name,
                PhoneNumber = courier.PhoneNumber,
                IsAvailable = courier.IsAvailable
            };

            return Ok(courierDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CourierCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var courier = new Courier
            {
                Name = createDto.Name,
                PhoneNumber = createDto.PhoneNumber,
                IsAvailable = createDto.IsAvailable
            };

            await _repo.Add(courier);

            var readDto = new CourierReadDto
            {
                Id = courier.Id,
                Name = courier.Name,
                PhoneNumber = courier.PhoneNumber,
                IsAvailable = courier.IsAvailable
            };

            return CreatedAtAction(nameof(GetById), new { id = courier.Id }, readDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CourierUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var courier = await _repo.GetById(id);

            if (courier == null)
            {
                return NotFound();
            }

            courier.Name = updateDto.Name;
            courier.PhoneNumber = updateDto.PhoneNumber;
            courier.IsAvailable = updateDto.IsAvailable;

            await _repo.Update(courier);

            var readDto = new CourierReadDto
            {
                Id = courier.Id,
                Name = courier.Name,
                PhoneNumber = courier.PhoneNumber,
                IsAvailable = courier.IsAvailable
            };

            return Ok(readDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var courier = await _repo.GetById(id);

            if (courier == null)
            {
                return NotFound(new { error = "Courier not found." });
            }

            if(await _repo.HasActiveDeliveries(id))
            {
                return BadRequest(new { error = "Cannot delete courier with active deliveries." });
            }

            await _repo.Delete(id); // Soft deleting
            return NoContent();
        }
    }
}
