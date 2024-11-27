// ���������� ��� ������ � API
window.apiHandler = {
    baseURL: "http://127.0.0.1:8000",

    getCSRFToken() {
        if (!document.cookie) {
            return null;
        }
        const xsrfCookies = document.cookie.split(';')
            .map(c => c.trim())
            .filter(c => c.startsWith('csrftoken='));

        if (xsrfCookies.length === 0) {
            return null;
        }
        return decodeURIComponent(xsrfCookies[0].split('=')[1]);
    },

    // ��������� GET ������ �� /u/api//test/
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/u/api/test/`, {
                method: "GET",
                credentials: "include" // �������� �������� �����
            });

            if (response.ok) {
                console.log("Connection successful!");
                return true;
            } else {
                console.error("Connection error:", response.statusText);
                return false;
            }
        } catch (error) {
            console.error("Error while requesting /test/:", error);
            return false;
        }
    },

    // ��������� POST ������ �� /u/api/login/
    async login(email, password) {
        const payload = {
            email: email,
            password: password
        };

        try {
            const response = await fetch(`${this.baseURL}/u/api/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include", // �������� ���� �������������
                body: JSON.stringify(payload)
            });

            const { id, message } = await response.json();

            if (response.ok) {
                console.log(message, "User ID:", id);
                return id; // ���������� ID ��� �������� �����������
            } else {
                console.error("Authentication error:", message);
                return null;
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            return null;
        }
    },

    async getUserData(id) {
        try {
            const response = await fetch(`${this.baseURL}/u/api/users/${id}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                console.error("Error fetching user data:", response.statusText);
                return null;
            }

            const userData = await response.json();
            console.log("User data retrieved:", userData);

            return {
                FirstName: userData.first_name,
                LastName: userData.last_name,
                FatherName: userData.father_name,
                Phone: userData.phone,
                Email: userData.email
            };
        } catch (error) {
            console.error("Error while requesting user data:", error);
            return null;
        }
    },

    // ��������� POST ������ �� /u/api/logout/
    async logout() {
        try {
            const response = await fetch(`${this.baseURL}/u/api/logout/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (response.ok) {
                console.log("Logout successful!");
                return true;
            } else {
                console.error("Logout error:", response.statusText);
                return false;
            }
        } catch (error) {
            console.error("Error while requesting /logout/:", error);
            return false;
        }
    },

    // ���������, ����������� �� ������������
    async isAuthenticated() {
        const sessionId = this.getCookie('sessionid'); // �������� �������� cookies � sessionid
        if (sessionId) {
            console.log("User is authenticated.");
            return true;
        } else {
            console.log("User is not authenticated.");
            return false;
        }
    },

    // ������� ��� ��������� cookie �� �����
    getCookie(name) {
        const cookieArr = document.cookie.split(";"); // ��������� ������ cookies
        for (let i = 0; i < cookieArr.length; i++) {
            let cookie = cookieArr[i].trim();
            if (cookie.startsWith(name + "=")) {
                return cookie.substring(name.length + 1); // ���������� �������� cookie
            }
        }
        return null; // ���� cookie �� �������, ���������� null
    }
};
