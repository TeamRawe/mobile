using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using System.Net;
using System.Linq;

public class AuthService
{
    private readonly HttpClient _httpClient;
    private readonly NavigationManager _navigationManager;

    public AuthService(HttpClient httpClient, NavigationManager navigationManager)
    {
        // Настройка HttpClient с CookieContainer
        var httpClientHandler = new HttpClientHandler()
        {
            AllowAutoRedirect = true,
            CookieContainer = new CookieContainer() // Для работы с cookies
        };

        _httpClient = new HttpClient(httpClientHandler);
        _navigationManager = navigationManager;
    }

    // Получение CSRF токена
    public async Task<string> GetCsrfTokenAsync()
    {
        var response = await _httpClient.GetAsync("http://127.0.0.1:8000/u/api/test");

        if (response.IsSuccessStatusCode)
        {
            // Получаем cookie из заголовков ответа
            var cookies = response.Headers.GetValues("Set-Cookie").ToList();
            var csrfTokenCookie = cookies.FirstOrDefault(cookie => cookie.Contains("csrftoken"));

            if (csrfTokenCookie != null)
            {
                // Извлекаем CSRF токен из cookie
                var csrfToken = csrfTokenCookie.Split('=')[1].Split(';')[0];
                return csrfToken;
            }
        }
        return null;
    }

    // Логин
    public async Task<bool> LoginAsync(string email, string password, string csrfToken)
    {
        var loginModel = new { email, password }; // Используем email
        var content = new StringContent(JsonSerializer.Serialize(loginModel), Encoding.UTF8, "application/json");
        content.Headers.Add("X-CSRFToken", csrfToken);  // Передаем CSRF токен в заголовке

        var response = await _httpClient.PostAsync("http://127.0.0.1:8000/u/api/login/", content);
        return response.IsSuccessStatusCode;
    }

    // Логаут
    public async Task LogoutAsync()
    {
        await _httpClient.PostAsync("http://127.0.0.1:8000/u/api/logout/", null);
        _navigationManager.NavigateTo("/auth");
    }

    public class JsonResponse
    {
        public string csrfToken { get; set; }
    }
}
