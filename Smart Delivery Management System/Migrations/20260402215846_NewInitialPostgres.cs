using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Smart_Delivery_Management_System.Migrations
{
    /// <inheritdoc />
    public partial class NewInitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Couriers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Couriers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Couriers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Deliveries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PickupAddress = table.Column<string>(type: "text", nullable: false),
                    DropoffAddress = table.Column<string>(type: "text", nullable: false),
                    PickupLatitude = table.Column<double>(type: "double precision", nullable: false),
                    PickupLongitude = table.Column<double>(type: "double precision", nullable: false),
                    DropoffLatitude = table.Column<double>(type: "double precision", nullable: false),
                    DropoffLongitude = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CourierId = table.Column<int>(type: "integer", nullable: true),
                    RouteOrder = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deliveries_Couriers_CourierId",
                        column: x => x.CourierId,
                        principalTable: "Couriers",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Deliveries",
                columns: new[] { "Id", "CourierId", "CreatedAt", "DeliveredAt", "DropoffAddress", "DropoffLatitude", "DropoffLongitude", "PickupAddress", "PickupLatitude", "PickupLongitude", "RouteOrder", "Status" },
                values: new object[] { 1, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Tel Aviv, Rothschild 10", 0.0, 0.0, "Tel Aviv, Dizengoff 1", 0.0, 0.0, null, "Pending" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "DeletedAt", "Email", "FullName", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, null, "alice@example.com", "Alice Cohen", "123456", "User" },
                    { 2, null, "bob@example.com", "Bob Levi", "987456", "User" },
                    { 3, null, "charlie@example.com", "Charlie Katz", "111111", "User" }
                });

            migrationBuilder.InsertData(
                table: "Couriers",
                columns: new[] { "Id", "DeletedAt", "IsAvailable", "Name", "PhoneNumber", "UserId" },
                values: new object[,]
                {
                    { 1, null, true, "David Shapiro", "0501234567", 1 },
                    { 2, null, true, "Ella Friedman", "0502345678", 2 },
                    { 3, null, false, "Frank Levy", "0503456789", 3 }
                });

            migrationBuilder.InsertData(
                table: "Deliveries",
                columns: new[] { "Id", "CourierId", "CreatedAt", "DeliveredAt", "DropoffAddress", "DropoffLatitude", "DropoffLongitude", "PickupAddress", "PickupLatitude", "PickupLongitude", "RouteOrder", "Status" },
                values: new object[,]
                {
                    { 2, 1, new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Jerusalem, King George 20", 0.0, 0.0, "Jerusalem, Jaffa 5", 0.0, 0.0, null, "Assigned" },
                    { 3, 2, new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Haifa, Herzl 15", 0.0, 0.0, "Haifa, Ben Gurion 3", 0.0, 0.0, null, "InProgress" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Couriers_UserId",
                table: "Couriers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_CourierId",
                table: "Deliveries",
                column: "CourierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Deliveries");

            migrationBuilder.DropTable(
                name: "Couriers");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
