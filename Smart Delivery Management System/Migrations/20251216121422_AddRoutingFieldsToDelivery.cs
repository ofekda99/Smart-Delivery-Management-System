using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Smart_Delivery_Management_System.Migrations
{
    /// <inheritdoc />
    public partial class AddRoutingFieldsToDelivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DropoffLatitude",
                table: "Deliveries",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "DropoffLongitude",
                table: "Deliveries",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "PickupLatitude",
                table: "Deliveries",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "PickupLongitude",
                table: "Deliveries",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "RouteOrder",
                table: "Deliveries",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Deliveries",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "DropoffLatitude", "DropoffLongitude", "PickupLatitude", "PickupLongitude", "RouteOrder" },
                values: new object[] { 0.0, 0.0, 0.0, 0.0, null });

            migrationBuilder.UpdateData(
                table: "Deliveries",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "DropoffLatitude", "DropoffLongitude", "PickupLatitude", "PickupLongitude", "RouteOrder" },
                values: new object[] { 0.0, 0.0, 0.0, 0.0, null });

            migrationBuilder.UpdateData(
                table: "Deliveries",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "DropoffLatitude", "DropoffLongitude", "PickupLatitude", "PickupLongitude", "RouteOrder" },
                values: new object[] { 0.0, 0.0, 0.0, 0.0, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DropoffLatitude",
                table: "Deliveries");

            migrationBuilder.DropColumn(
                name: "DropoffLongitude",
                table: "Deliveries");

            migrationBuilder.DropColumn(
                name: "PickupLatitude",
                table: "Deliveries");

            migrationBuilder.DropColumn(
                name: "PickupLongitude",
                table: "Deliveries");

            migrationBuilder.DropColumn(
                name: "RouteOrder",
                table: "Deliveries");
        }
    }
}
