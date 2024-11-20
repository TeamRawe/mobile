async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt); // Конкатенация пароля и соли
    const hash = await crypto.subtle.digest("SHA-256", data); // Хэшируем с SHA-256
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join(""); // Преобразуем в строку
}
