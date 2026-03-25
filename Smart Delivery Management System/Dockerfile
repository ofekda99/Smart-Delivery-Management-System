FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# תחליף את Smart Delivery Management System.csproj בשם המדויק של הקובץ שלך
COPY ["Smart Delivery Management System.csproj", "."]
RUN dotnet restore "./Smart Delivery Management System.csproj"
COPY . .
RUN dotnet publish "Smart Delivery Management System.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# תחליף את Smart Delivery Management System.dll בשם המדויק של ה-DLL שלך
ENTRYPOINT ["dotnet", "Smart Delivery Management System.dll"]