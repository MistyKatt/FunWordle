# =========================
# 1. Build / publish stage
# =========================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first (for better restore caching)
COPY FunWordle.sln ./

COPY FunWordle.API/FunWordle.API.csproj ./FunWordle.API/
COPY FunWordle.Core/FunWordle.Core.csproj ./FunWordle.Core/
COPY FunWordle/FunWordle.Cli.csproj ./FunWordle/

# Restore only the API project (which will pull its project references)
RUN dotnet restore ./FunWordle.API/FunWordle.API.csproj

# Now copy the rest of the source tree
COPY . .

# Publish the API
WORKDIR /src/FunWordle.API
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# =========================
# 2. Runtime stage
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

# Use your real assembly name here
ENTRYPOINT ["dotnet", "FunWordle.API.dll"]

