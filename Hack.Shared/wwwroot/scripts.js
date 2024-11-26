function getCookieValue(cookieName) {
    if (!document.cookie) return null;

    const cookies = document.cookie.split(';').map(c => c.trim());
    const match = cookies.find(c => c.startsWith(cookieName + "="));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
}


function getCSRFToken() {
    if (!document.cookie) {
        return null;
    }
    const xsrfCookies = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith('csrftoken' + '='));

    if (xsrfCookies.length === 0) {
        return null;
    }
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}


window.getCsrfTokenFromCookies = () => {
    // Пример извлечения CSRF токена из cookies
    const csrfToken = document.cookie.split(';')
        .find(row => row.trim().startsWith('csrftoken='))
        ?.split('=')[1];
    return csrfToken || null;
}