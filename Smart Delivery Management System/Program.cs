using Microsoft.EntityFrameworkCore;
using Smart_Delivery_Management_System.Data;
using Smart_Delivery_Management_System.Models;
using Smart_Delivery_Management_System.Repositories;
using Smart_Delivery_Management_System.Services;
using Smart_Delivery_Management_System.Services.Routing;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICourierRepository, CourierRepository>();
builder.Services.AddScoped<IDeliveryRepository, DeliveryRepository>();
builder.Services.AddScoped<ICourierAssignmentService, CourierAssignmentService>();
builder.Services.AddScoped<IRouteOptimizationService, NearestNeighborRouteService>();
builder.Services.AddScoped<IRoutePlanningService, RoutePlanningService>();
builder.Services.AddHttpClient<IGeocodingService, NominatimService>();

builder.Services.Configure<DeliverySetting>(
    builder.Configuration.GetSection("DeliverySettings"));

builder.Services.AddDbContext<DeliveryDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
