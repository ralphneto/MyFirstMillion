namespace MyFirstMillionAPI.Application.DTOs;

public record GoogleLoginRequest(string idToken);
public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record CompleteProfileRequest(string Name, string Currency, string RiskProfile);
