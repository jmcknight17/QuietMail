using Microsoft.AspNetCore.Mvc;

namespace QuietMail.Api.Controllers;

[Route("api/[controller]")]

public class SubscriptionsController : ControllerBase
{
    [HttpGet("Test")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetSubscriptions()
    {
        var dummyData = new[]
        {
            new{Sender = "HMRC", EmailCount = 12},
            new{Sender = "PSNI", EmailCount = 13},
        };
        
        return Ok(dummyData);
    }
}