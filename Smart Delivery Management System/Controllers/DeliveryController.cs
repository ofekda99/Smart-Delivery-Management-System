using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Smart_Delivery_Management_System.DTOs.DeliveryDto;
using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.Repositories;
using Smart_Delivery_Management_System.Services;

namespace Smart_Delivery_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveryController : ControllerBase
    {
        private readonly IDeliveryRepository _repo;
        private readonly IGeocodingService _geocodingService;
        public DeliveryController(IDeliveryRepository repo, IGeocodingService geocodingService)
        {
            _repo = repo;
            _geocodingService = geocodingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var deliveries = await _repo.GetAll();
            var deliveriesDto = deliveries.Select(d => new DeliveryReadDto
            {
                Id = d.Id,
                PickupAddress = d.PickupAddress,
                DropoffAddress = d.DropoffAddress,
                Status = d.Status,
                CourierId = d.CourierId,
                CreatedAt = d.CreatedAt,
                DeliveredAt = d.DeliveredAt
            }).ToList();

            return Ok(deliveriesDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var delivery = await _repo.GetById(id);

            if (delivery == null)
            {
                return NotFound(new { error = "Delivery not found." });
            }

            var dto = new DeliveryReadDto
            {
                Id = delivery.Id,
                PickupAddress = delivery.PickupAddress,
                DropoffAddress = delivery.DropoffAddress,
                Status = delivery.Status,
                CourierId = delivery.CourierId,
                CreatedAt = delivery.CreatedAt,
                DeliveredAt = delivery.DeliveredAt
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(DeliveryCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var pickupTask = _geocodingService.GetCoordinatesAsync(createDto.PickupAddress); 
            var dropoffTask = _geocodingService.GetCoordinatesAsync(createDto.DropoffAddress);
            await Task.WhenAll(pickupTask, dropoffTask);
            var pickupCoordinates = await pickupTask;
            var dropoffCoordinates = await pickupTask;

            var delivery = new Delivery
            {
                PickupAddress = createDto.PickupAddress,
                PickupLatitude = pickupCoordinates.Value.lat,
                PickupLongitude = pickupCoordinates.Value.lon,
                DropoffAddress = createDto.DropoffAddress,
                DropoffLatitude = dropoffCoordinates.Value.lat,
                DropoffLongitude = dropoffCoordinates.Value.lon,
                Status = createDto.Status,
                CourierId = createDto.CourierId,
                CreatedAt = DateTime.UtcNow
            };

            await _repo.Add(delivery);

            var pickupAddressCoordinates = await _geocodingService.GetCoordinatesAsync(createDto.PickupAddress);

            var dto = new DeliveryReadDto
            {

                Id = delivery.Id,
                PickupAddress = delivery.PickupAddress,
                DropoffAddress = delivery.DropoffAddress,
                Status = delivery.Status,
                CourierId = delivery.CourierId,
                CreatedAt = delivery.CreatedAt,
                DeliveredAt = delivery.DeliveredAt
            };

            return CreatedAtAction(nameof(GetById), new { id = delivery.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DeliveryUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var delivery = await _repo.GetById(id);
            if (delivery == null)
            {
                return NotFound(new { error = "Delivery not found." });
            }

            delivery.PickupAddress = updateDto.PickupAddress;
            delivery.DropoffAddress = updateDto.DropoffAddress;
            delivery.Status = updateDto.Status;
            delivery.CourierId = updateDto.CourierId;
            delivery.DeliveredAt = updateDto.DeliveredAt;

            await _repo.Update(delivery);

            var dto = new DeliveryReadDto
            {
                Id = delivery.Id,
                PickupAddress = delivery.PickupAddress,
                DropoffAddress = delivery.DropoffAddress,
                Status = delivery.Status,
                CourierId = delivery.CourierId,
                CreatedAt = delivery.CreatedAt,
                DeliveredAt = delivery.DeliveredAt
            };

            return Ok(dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var delivery = await _repo.GetById(id);
            if (delivery == null)
            {
                return NotFound(new { error = "Delivery not found." });
            }

            await _repo.Delete(id);
            return NoContent();
            // return Ok(new { message = "Delivery deleted successfully." });
        }
    }
}
