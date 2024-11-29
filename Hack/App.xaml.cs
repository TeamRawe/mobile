using System.Net.Http;
using Microsoft.Maui.Controls;
using Microsoft.Extensions.DependencyInjection;

namespace Hack
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();

            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://10.0.2.2:8000/") // Базовый URL для API
            };

            // Регистрация HttpClient в DI контейнере
            DependencyService.RegisterSingleton(httpClient);
        }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            return new Window(new MainPage()) { Title = "Hack" };
        }
    }
}
