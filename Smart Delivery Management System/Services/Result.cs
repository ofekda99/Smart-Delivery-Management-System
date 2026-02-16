using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.DTOs.CourierAssignments;

namespace Smart_Delivery_Management_System.Services
{
    public class Result
    {
        public bool IsSuccess { get; private set; }

        public string? ErrorMsg { get; private set; }

        public List<CourierAssignmentDto> Assignments { get; set; }

        private Result()
        {
            
        }

        public static Result Fail(string error)
        {
            return new Result
            {
                IsSuccess = false,
                ErrorMsg = error,
                Assignments = null
            };
        }

        public static Result Success(List<CourierAssignmentDto> assignments)
        {
            return new Result
            {
                IsSuccess = true,
                Assignments = assignments,
                ErrorMsg = null
            };
        }
    }

}
