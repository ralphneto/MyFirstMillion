using MyFirstMillionAPI.Domain.Entities;

namespace MyFirstMillionAPI.Application.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}
