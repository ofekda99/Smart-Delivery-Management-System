using Smart_Delivery_Management_System.Models;

namespace Smart_Delivery_Management_System.Services.Routing
{
    public class NearestNeighborRouteService : IRouteOptimizationService
    {

        private const double EarthRadiusKm = 6371.0;
        public List<Delivery> OptimizeRouteForCourier(List<Delivery> assignedDeliveries,
                                                      DeliverySetting settings)
        {
            double currentLatitude = settings.OriginLatitude;
            double currentLongitude = settings.OriginLongitude;
            double currDistance, minDistance;
            Delivery bestDelivery;
            List<Delivery> remainingDeliveries = new List<Delivery>(assignedDeliveries);
            List<Delivery> deliveriesRoute = new List<Delivery>();

            while (remainingDeliveries.Count > 0)
            {
                bestDelivery = null;
                minDistance = double.MaxValue;
                foreach (var delivery in remainingDeliveries)
                {
                    currDistance = CalculateHaversineDistance(currentLatitude, currentLongitude,
                        delivery.DropoffLatitude, delivery.DropoffLongitude);

                    if (currDistance < minDistance)
                    {
                        minDistance = currDistance;
                        bestDelivery = delivery;
                    }

                }

                if (bestDelivery != null)
                {
                    currentLongitude = bestDelivery.DropoffLongitude;
                    currentLatitude = bestDelivery.DropoffLatitude;
                    remainingDeliveries.Remove(bestDelivery);
                    deliveriesRoute.Add(bestDelivery);
                }
            }

            return deliveriesRoute;
        }

        private static double CalculateHaversineDistance(
        double lat1, double lon1,
        double lat2, double lon2)
        {
            // Convert degrees into radians
            double dLat = ToRadians(lat2 - lat1);
            double dLon = ToRadians(lon2 - lon1);

            double rLat1 = ToRadians(lat1);
            double rLat2 = ToRadians(lat2);

            // Haversine formula
            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(rLat1) * Math.Cos(rLat2) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return EarthRadiusKm * c; // Kilometers
        }

        private static double ToRadians(double angle)
        {
            return angle * Math.PI / 180.0;
        }
    }
}