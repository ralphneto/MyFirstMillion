using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyFirstMillionAPI.Domain.Entities;
using MyFirstMillionAPI.Infrastructure.Contexts;
using MyFirstMillionAPI.Infrastructure.Security;

namespace MyFirstMillionAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? type)
    {
        var userId = User.GetUserId();

        var query = _context.Categories
            .Where(c => (c.IsSystem || c.UserId == userId) && c.IsActive && c.ParentCategoryId == null)
            .Include(c => c.SubCategories.Where(s => s.IsActive))
            .AsQueryable();

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<TransactionType>(type, true, out var tt))
            query = query.Where(c => c.Type == tt);

        var categories = await query
            .OrderBy(c => c.IsSystem ? 0 : 1)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return Ok(categories.Select(c => new
        {
            c.Id,
            c.Name,
            Type = c.Type.ToString(),
            c.Icon,
            c.Color,
            c.IsSystem,
            SubCategories = c.SubCategories.Select(s => new
            {
                s.Id,
                s.Name,
                Type = s.Type.ToString(),
                s.Icon,
                s.Color,
                s.IsSystem
            })
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest dto)
    {
        var userId = User.GetUserId();

        if (!Enum.TryParse<TransactionType>(dto.Type, out var type))
            return BadRequest("Tipo de categoria inválido.");

        var category = new Category
        {
            UserId = userId,
            Name = dto.Name,
            Type = type,
            Icon = dto.Icon,
            Color = dto.Color,
            ParentCategoryId = dto.ParentCategoryId,
            IsSystem = false
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { }, category.Id);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId && !c.IsSystem);

        if (category == null) return NotFound();

        category.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateCategoryRequest(
    string Name,
    string Type,
    string Icon,
    string Color,
    int? ParentCategoryId
);
