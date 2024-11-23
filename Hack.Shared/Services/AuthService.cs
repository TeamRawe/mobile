using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Text;


public class AuthService
{
    private readonly NavigationManager _navigationManager;
    private readonly IJSRuntime _jsRuntime;

    public string ErrorMessage { get; private set; }
    public bool IsLoggedIn { get; private set; } = false;

    private readonly Dictionary<string, string> _testUsers = new()
    {
        { "test@example.com", "password123" },
        { "admin@example.com", "adminpass" }
    };

    public AuthService(NavigationManager navigationManager, IJSRuntime jsRuntime)
    {
        _navigationManager = navigationManager;
        _jsRuntime = jsRuntime;
    }

    public async Task<bool> Login(string email, string password)
    {
        if (_testUsers.TryGetValue(email, out var storedPassword) && storedPassword == password)
        {
            IsLoggedIn = true;

            // Сохраняем состояние входа в localStorage
            await _jsRuntime.InvokeVoidAsync("localStorage.setItem", "isLoggedIn", "true");

            return true;
        }
        else
        {
            ErrorMessage = "Неверный email или пароль.";
            return false;
        }
    }

    public async Task Logout()
    {
        IsLoggedIn = false;

        // Удаляем состояние входа из localStorage
        await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", "isLoggedIn");

        _navigationManager.NavigateTo("/auth");
    }

    public async Task CheckLoginStatus()
    {
        // Проверяем состояние входа из localStorage
        var isLoggedIn = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", "isLoggedIn");
        IsLoggedIn = isLoggedIn == "true";

        if (!IsLoggedIn)
        {
            // Если пользователь не авторизован, перенаправляем на страницу авторизации
            _navigationManager.NavigateTo("/auth");
        }
    }
}






/*
public class AuthService
{
    private readonly HttpClient _httpClient;
    private readonly IJSRuntime _jsRuntime;
    private readonly NavigationManager _navigationManager;

    public string ErrorMessage { get; private set; }

    public AuthService(HttpClient httpClient, IJSRuntime jsRuntime, NavigationManager navigationManager)
    {
        _httpClient = httpClient;
        _jsRuntime = jsRuntime;
        _navigationManager = navigationManager;
    }

    private async Task<string> GetCsrfTokenFromCookieAsync()
    {
        try
        {
            var cookie = await _jsRuntime.InvokeAsync<string>("eval", "document.cookie");
            var csrfToken = cookie.Split(';')
                                   .FirstOrDefault(c => c.Trim().StartsWith("csrftoken="))?
                                   .Split('=')[1];
            return csrfToken;
        }
        catch
        {
            ErrorMessage = "Ошибка при извлечении CSRF токена.";
            return null;
        }
    }

    public async Task<bool> GetCsrfToken()
    {
        try
        {
            // Отправляем GET запрос для получения CSRF токена
            var response = await _httpClient.GetAsync("https://localhost:5087/api/auth/csrf-token");

            if (response.IsSuccessStatusCode)
            {
                // Получаем CSRF токен из cookies
                var csrfToken = await GetCsrfTokenFromCookieAsync();
                if (csrfToken != null)
                {
                    // Добавляем CSRF токен в заголовки для последующих запросов
                    _httpClient.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrfToken);
                    return true;
                }
                else
                {
                    ErrorMessage = "CSRF токен не найден.";
                    return false;
                }
            }
            else
            {
                ErrorMessage = "Ошибка при получении CSRF токена: " + response.ReasonPhrase;
                return false;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = "Ошибка соединения: " + ex.Message;
            return false;
        }
    }

    // Метод для логина
    public async Task<bool> Login(string email, string password)
    {
        var loginModel = new
        {
            email = email,
            password = password
        };

        var content = new StringContent(JsonConvert.SerializeObject(loginModel), Encoding.UTF8, "application/json");

        // Логирование тела запроса
        Debug.WriteLine("Request Content: " + await content.ReadAsStringAsync());

        try
        {
            // Сначала получаем CSRF токен, если не получен
            var csrfTokenObtained = await GetCsrfToken();
            if (!csrfTokenObtained)
            {
                return false;
            }

            // Теперь делаем запрос на сервер для авторизации
            var response = await _httpClient.PostAsync("https://localhost:5087/api/auth/login", content);

            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            else
            {
                // Обработка ошибок
                ErrorMessage = "Ошибка авторизации: " + response.ReasonPhrase;
                return false;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = "Ошибка соединения: " + ex.Message;
            return false;
        }
    }
  

    // Метод для logout
    public async Task Logout()
    {
        try
        {
            // Отправляем запрос на сервер для выхода
            var response = await _httpClient.PostAsync("https://localhost:5087/api/auth/logout", null);

            if (response.IsSuccessStatusCode)
            {
                // Перенаправляем на страницу авторизации после выхода
                _navigationManager.NavigateTo("/auth");
            }
            else
            {
                ErrorMessage = "Ошибка при выходе: " + response.ReasonPhrase;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = "Ошибка соединения: " + ex.Message;
        }
    }
}
*/