using Google.Apis.Auth;

namespace MyFirstMillionAPI.Application.Services;

public class GoogleTokenValidator
{
    private readonly string _clientId;

    public GoogleTokenValidator(IConfiguration config)
    {
        _clientId = config["Google:ClientId"]
            ?? throw new InvalidOperationException("Google:ClientId not configured.");
    }

    public async Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = [_clientId]
        };
        return await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
    }
}
