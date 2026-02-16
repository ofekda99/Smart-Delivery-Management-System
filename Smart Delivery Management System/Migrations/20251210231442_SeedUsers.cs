using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Smart_Delivery_Management_System.Migrations
{
    /// <inheritdoc />
    public partial class SeedUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Deliveries",
                columns: new[] { "Id", "CourierId", "CreatedAt", "DeliveredAt", "DropoffAddress", "PickupAddress", "Status" },
                values: new object[] { 1, null, new DateTime(2025, 12, 10, 23, 14, 40, 219, DateTimeKind.Utc).AddTicks(4135), null, "Tel Aviv, Rothschild 10", "Tel Aviv, Dizengoff 1", "Pending" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "FullName", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, "alice@example.com", "Alice Cohen", "123456", "User" },
                    { 2, "bob@example.com", "Bob Levi", "987456", "User" },
                    { 3, "charlie@example.com", "Charlie Katz", "111111", "User" }
                });

            migrationBuilder.InsertData(
                table: "Couriers",
                columns: new[] { "Id", "IsAvailable", "Name", "PhoneNumber", "UserId" },
                values: new object[,]
                {
                    { 1, true, "David Shapiro", "0501234567", 1 },
                    { 2, true, "Ella Friedman", "0502345678", 2 },
                    { 3, false, "Frank Levy", "0503456789", 3 }
                });

            migrationBuilder.InsertData(
                table: "Deliveries",
                columns: new[] { "Id", "CourierId", "CreatedAt", "DeliveredAt", "DropoffAddress", "PickupAddress", "Status" },
                values: new object[,]
                {
                    { 2, 1, new DateTime(2025, 12, 10, 23, 14, 40, 219, DateTimeKind.Utc).AddTicks(4675), null, "Jerusalem, King George 20", "Jerusalem, Jaffa 5", "Assigned" },
                    { 3, 2, new DateTime(2025, 12, 10, 23, 14, 40, 219, DateTimeKind.Utc).AddTicks(4680), null, "Haifa, Herzl 15", "Haifa, Ben Gurion 3", "InProgress" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Couriers",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Deliveries",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Deliveries",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Deliveries",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Couriers",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Couriers",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
