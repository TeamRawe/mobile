using Microsoft.AspNetCore.Components.WebView.Maui;

namespace Hack
{
    public partial class MainPage : ContentPage
    {
        public MainPage()
        {
            InitializeComponent();

            Loaded += async (s, e) =>
            {
                var webView = this.FindByName<BlazorWebView>("BlazorWebView");
                if (webView != null)
                {
                    // Выполнение действия после загрузки WebView
                }
            };
        }
    }
}
