FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# שימוש ב-Wildcard כדי למצוא את ה-csproj בכל מקרה
COPY ["*.csproj", "./"]
RUN dotnet restore

# העתקת כל שאר הקבצים
COPY . .

# בנייה של הפרויקט
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# פקודת ההרצה - כאן תצטרך לוודא ששם ה-dll נכון
# אם שם הפרויקט שלך הוא Smart Delivery Management System, ה-dll יהיה דומה
ENTRYPOINT ["dotnet", "Smart Delivery Management System.dll"]
