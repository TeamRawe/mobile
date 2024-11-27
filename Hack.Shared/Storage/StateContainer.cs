using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.JSInterop;

public class StateContainer
{
    private readonly IJSRuntime _jsRuntime;

    public StateContainer(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    public string UserId { get; private set; } = string.Empty;

    public async Task SetUserIdAsync(string userId)
    {
        UserId = userId;
        await _jsRuntime.InvokeVoidAsync("localStorage.setItem", "UserId", userId);
    }

    public async Task LoadUserIdAsync()
    {
        UserId = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", "UserId") ?? string.Empty;
    }
}


