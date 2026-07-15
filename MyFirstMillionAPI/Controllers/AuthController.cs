using BCrypt.Net;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyFirstMillionAPI.Application.DTOs;
using MyFirstMillionAPI.Application.Services;
using MyFirstMillionAPI.Domain.Entities;
using MyFirstMillionAPI.Infrastructure.Contexts;
using MyFirstMillionAPI.Infrastructure.Security;

namespace MyFirstMillionAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly GoogleTokenValidator _google;
    private readonly IJwtService _jwt;

    public AuthController(AppDbContext context, GoogleTokenValidator google, IJwtService jwt)
    {
        _context = context;
        _google = google;
        _jwt = jwt;
    }

    [AllowAnonymous]
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.idToken))
            return BadRequest("idToken não recebido.");

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await _google.ValidateAsync(request.idToken);
        }
        catch (Exception ex)
        {
            return Unauthorized(ex.Message);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

        if (user == null)
        {
            user = new User
            {
                Email = payload.Email,
                Name = payload.Name,
                PictureUrl = payload.Picture,
                IsProfileCompleted = false
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        return Ok(new { token = _jwt.GenerateToken(user) });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("E-mail já cadastrado.");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { token = _jwt.GenerateToken(user) });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Usuário ou senha inválidos.");

        return Ok(new { token = _jwt.GenerateToken(user) });
    }

    [Authorize]
    [HttpPost("complete-profile")]
    public async Task<IActionResult> CompleteProfile([FromBody] CompleteProfileRequest dto)
    {
        var userId = User.GetUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.Name = dto.Name;
        user.Currency = dto.Currency;

        if (Enum.TryParse<RiskProfile>(dto.RiskProfile, out var rp))
            user.RiskProfile = rp;

        user.IsProfileCompleted = true;
        await _context.SaveChangesAsync();

        return Ok(new { token = _jwt.GenerateToken(user) });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.GetUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.PictureUrl,
            user.Currency,
            RiskProfile = user.RiskProfile.ToString(),
            user.IsProfileCompleted,
            user.CreatedAt
        });
    }
}
