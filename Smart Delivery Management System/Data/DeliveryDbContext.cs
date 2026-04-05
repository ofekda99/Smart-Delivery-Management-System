
using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.Models;
using System;

namespace Smart_Delivery_Management_System.Data
{
    public class DeliveryDbContext : DbContext
    {
        public DeliveryDbContext(DbContextOptions<DeliveryDbContext> options)
            : base(options)
        {

        }

        public DbSet<User> Users { get; set; }

        public DbSet<Courier> Couriers { get; set; }

        public DbSet<Delivery> Deliveries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Courier>()
                .HasOne(c => c.User)
                .WithOne() // user doesn't have navigation back
                .HasForeignKey<Courier>(c => c.UserId);

            modelBuilder.Entity<Delivery>()
                .HasOne(d => d.Courier)
                .WithMany(c => c.Deliveries)
                .HasForeignKey(d => d.CourierId);

            modelBuilder.Entity<Courier>().HasQueryFilter(c => c.DeletedAt == null);
            modelBuilder.Entity<User>().HasQueryFilter(u => u.DeletedAt == null);

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, FullName = "Alice Cohen", Email = "alice@example.com", PasswordHash = "123456", Role = "User" },
                new User { Id = 2, FullName = "Bob Levi", Email = "bob@example.com", PasswordHash = "987456", Role = "User" },
                new User { Id = 3, FullName = "Charlie Katz", Email = "charlie@example.com", PasswordHash = "111111", Role = "User" }
            );

            modelBuilder.Entity<Courier>().HasData(
         new Courier { Id = 1, Name = "David Shapiro", PhoneNumber = "0501234567", IsAvailable = true, UserId = 1 },
         new Courier { Id = 2, Name = "Ella Friedman", PhoneNumber = "0502345678", IsAvailable = true, UserId = 2 },
         new Courier { Id = 3, Name = "Frank Levy", PhoneNumber = "0503456789", IsAvailable = false, UserId = 3 }
     );

            // Seed Deliveries
            modelBuilder.Entity<Delivery>().HasData(
                new Delivery
                {
                    Id = 1,
                    PickupAddress = "Tel Aviv, Dizengoff 1",
                    DropoffAddress = "Tel Aviv, Rothschild 10",
                    Status = "Pending",
                    CourierId = null,
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new Delivery
                {
                    Id = 2,
                    PickupAddress = "Jerusalem, Jaffa 5",
                    DropoffAddress = "Jerusalem, King George 20",
                    Status = "Assigned",
                    CourierId = 1,
                    CreatedAt = new DateTime(2024, 1, 2)
                },
                new Delivery
                {
                    Id = 3,
                    PickupAddress = "Haifa, Ben Gurion 3",
                    DropoffAddress = "Haifa, Herzl 15",
                    Status = "InProgress",
                    CourierId = 2,
                    CreatedAt = new DateTime(2024, 1, 3)
                }
            );

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        property.SetColumnType("timestamp without time zone");
                    }
                }
            }

            base.OnModelCreating(modelBuilder);
        }

    }
}
