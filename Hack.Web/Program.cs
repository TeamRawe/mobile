using Hack.Web.Components;
using Microsoft.JSInterop;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddScoped<StateContainer>();


// Register the JavaScript interaction service (AuthService)

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve static files (ensure JavaScript files are in wwwroot)
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(Hack.Shared._Imports).Assembly);

app.Run();
