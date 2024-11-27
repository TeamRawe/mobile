        {
            var response = await _httpClient.PostAsync("http://127.0.0.1:8000/u/api/login/", content);

            if (response.IsSuccessStatusCode)
            {
                // Извлекаем cookies с csrf токеном и sessionid
                var cookies = response.Headers.GetValues("Set-Cookie").ToList();
                string csrfToken = cookies.FirstOrDefault(c => c.StartsWith("csrftoken="))?.Split('=')[1];
                string sessionId = cookies.FirstOrDefault(c => c.StartsWith("sessionid="))?.Split('=')[1];

                // Если CSRF токен найден, сохраняем его
                if (!string.IsNullOrEmpty(csrfToken))
                {
                    // Добавляем CSRF токен в заголовки для всех последующих запросов
                    _httpClient.DefaultRequestHeaders.Add("X-CSRFToken", csrfToken);
                    // Сохраняем CSRF токен в cookie для использования на клиенте
                    await _jsRuntime.InvokeVoidAsync("eval", $"document.cookie = 'csrftoken={csrfToken}; path=/; SameSite=None; Secure'");
                }
                else
                {
                    ErrorMessage = "CSRF токен не найден в куки.";
                }

                // Если sessionId найден, сохраняем его
                if (!string.IsNullOrEmpty(sessionId))
                {
                    // Сохраняем sessionid в cookie для использования на клиенте
                    await _jsRuntime.InvokeVoidAsync("eval", $"document.cookie = 'sessionid={sessionId}; path=/; SameSite=None; Secure'");

                    IsAuthenticated = true; // Устанавливаем статус авторизации
                }
                else
                {
                    ErrorMessage = "Session ID не найден в куки.";
                }

                return true;
            }
            else
            {
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
    public async Task SetAuthHeadersAsync()
    {
        try
        {
            var csrfToken = await GetCsrfTokenFromCookieAsync();

            // Устанавливаем CSRF токен, если он есть
            if (!string.IsNullOrEmpty(csrfToken))
            {
                _httpClient.DefaultRequestHeaders.Remove("X-CSRFToken");
                _httpClient.DefaultRequestHeaders.Add("X-CSRFToken", csrfToken);
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при установке заголовков авторизации: {ex.Message}";
        }
    }



    public async Task Logout()
    {
        try
        {
            // Получаем CSRF токен из cookies
            var csrfToken = await GetCsrfTokenFromCookieAsync();

            if (string.IsNullOrEmpty(csrfToken))
            {
                ErrorMessage = "CSRF токен не найден.";
                return;
            }

            // Создаем запрос на логаут с CSRF токеном
            var request = new HttpRequestMessage(HttpMethod.Post, "http://127.0.0.1:8000/u/api/logout/");
            request.Headers.Add("X-CSRFToken", csrfToken); // Добавляем CSRF токен в заголовки запроса

            var response = await _httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                // Удаляем cookies для sessionid и csrftoken
                await _jsRuntime.InvokeVoidAsync("eval", "document.cookie = 'sessionid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure'");
                await _jsRuntime.InvokeVoidAsync("eval", "document.cookie = 'csrftoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure'");

                // Перенаправляем пользователя на страницу логина
                _navigationManager.NavigateTo("/auth");

                // Обновляем статус авторизации
                IsAuthenticated = false;
            }
            else
            {
                ErrorMessage = $"Ошибка при выходе: {response.StatusCode} {response.ReasonPhrase}";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = "Ошибка соединения: " + ex.Message;
        }
    }


    private async Task<string> GetCsrfTokenFromCookieAsync()
    {
        try
        {
            var cookie = await _jsRuntime.InvokeAsync<string>("eval", "document.cookie");
            var csrfToken = cookie.Split(';')
                                  .Select(c => c.Trim())
                                  .FirstOrDefault(c => c.StartsWith("csrftoken="))?
                                  .Split('=')[1];

            return csrfToken;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при извлечении CSRF токена: {ex.Message}";
            return null;
        }
    }

    public async Task<bool> IsAuthenticatedAsync()
    {
        var sessionId = await GetCookieValue("sessionid");
        return !string.IsNullOrEmpty(sessionId);
    }

    private async Task<string> GetCookieValue(string cookieName)
    {
        try
        {
            var cookie = await _jsRuntime.InvokeAsync<string>("eval", "document.cookie");
            var value = cookie.Split(';')
                              .Select(c => c.Trim())
                              .FirstOrDefault(c => c.StartsWith($"{cookieName}="))?
                              .Split('=')[1];
            return value ?? string.Empty;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при извлечении куки {cookieName}: {ex.Message}";
            return string.Empty;
        }
    }
}
