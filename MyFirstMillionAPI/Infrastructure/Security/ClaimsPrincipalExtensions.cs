using System.Security.Claims;

namespace MyFirstMillionAPI.Infrastructure.Security;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? principal.FindFirstValue("sub");

        if (int.TryParse(sub, out var id))
            return id;

        throw new UnauthorizedAccessException("User ID claim not found.");
    }
}
