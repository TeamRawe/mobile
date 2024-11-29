// Обработчик для работы с API
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

    // Выполняет GET запрос на /u/api//test/
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/u/api/test/`, {
                method: "GET",
                credentials: "include" // Включает передачу куков
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

    // Выполняет POST запрос на /u/api/login/
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
                credentials: "include", // Передает куки автоматически
                body: JSON.stringify(payload)
            });

            const { id, message } = await response.json();

            if (response.ok) {
                console.log(message, "User ID:", id);
                return id; // Возвращаем ID при успешной авторизации
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

    // Выполняет POST запрос на /u/api/logout/
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

    async isAuthenticated() {
        try {
            const sessionId = this.getCookie('sessionid');
            if (!sessionId) {
                console.log("User is not authenticated: no session cookie found.");
                return false;
            }

            const response = await fetch(`${this.baseURL}/u/api/check_session/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": this.getCSRFToken() 
                },
                credentials: 'include', 
            });
            console.log("Response status:", response.status);
            if (response.ok) {
                console.log("User is authenticated.");
                return true;
            } else {
                console.log("User is not authenticated: session invalid or expired.");
                return false;
            }
        } catch (error) {
            console.error("Error checking authentication:", error);
            return false;
        }
    },
    // Функция для получения cookie по имени
    getCookie(name) {
        const cookieArr = document.cookie.split(";"); // Разбиваем строку cookies
        for (let i = 0; i < cookieArr.length; i++) {
            let cookie = cookieArr[i].trim();
            if (cookie.startsWith(name + "=")) {
                return cookie.substring(name.length + 1); // Возвращаем значение cookie
            }
        }
        return null; // Если cookie не найдена, возвращаем null
    },

    async fetchProjects() {
        const response = await fetch(`${this.baseURL}/p/api/e/user_projects/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": this.getCSRFToken()
            },
            credentials: "include"
        });
    if (!response.ok) {
        throw new Error("Ошибка при загрузке проектов: " + response.statusText);
    }
    return await response.json();
    },
    async getCustomerName(customerId) {
        try {
            const response = await fetch(`${this.baseURL}/c/api/govs/${customerId}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (!response.ok) {
                console.error("Ошибка загрузки заказчика:", response.status, response.statusText);
                throw new Error("Ошибка загрузки заказчика: " + response.statusText);
            }

            // Извлечение только поля title из ответа
            const data = await response.json();
            console.log(`Имя заказчика (${customerId}):`, data.title); // Получаем только title
            return data.title; // Возвращаем только title
        } catch (error) {
            console.error(`Ошибка в getCustomerName для ID ${customerId}:`, error.message);
            throw error;
        }
    },

    async fetchStages(projectId) {
        try {
            const apiUrl = `${this.baseURL}/p/api/e/project_stages/${projectId}/`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            // Проверка успешности запроса
            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
            }

            // Парсим данные
            const stages = await response.json();

            // Если нет данных, возвращаем пустой массив
            if (!stages || stages.length === 0) {
                console.log('Нет данных для этапов');
                return []; // Возвращаем пустой список
            }

            return stages;
        } catch (error) {
            console.error('Ошибка загрузки данных об этапах проекта:', error);
            return []; // Возвращаем пустой список в случае ошибки
        }
    },
    async getWorkerName(workerId) {
        try {
            // Формируем URL для запроса
            const apiUrl = `${this.baseURL}/c/api/subs/${workerId}/`;

            // Выполняем запрос
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": this.getCSRFToken() // Если нужен CSRF-токен
                },
                credentials: "include" // Для отправки cookies вместе с запросом
            });

            // Проверяем успешность ответа
            if (!response.ok) {
                console.error(`Ошибка запроса для подрядчика ID ${workerId}: ${response.status} ${response.statusText}`);
                throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
            }

            // Парсим данные из ответа
            const workerData = await response.json();

            // Проверяем наличие поля title
            if (!workerData || !workerData.title) {
                console.error(`Данные для подрядчика ID ${workerId} некорректны или отсутствует поле title.`);
                return "Неизвестный подрядчик"; // Возвращаем сообщение вместо null
            }

            // Возвращаем поле title
            console.log(`Название подрядчика (${workerId}):`, workerData.title);
            return workerData.title;
        } catch (error) {
            console.error(`Ошибка загрузки подрядчика ID ${workerId}:`, error.message);
            return "Ошибка загрузки"; // Возвращаем сообщение об ошибке
        }
    },


    //               FOR          DOCUMENTS 

    // Получить список проектов с фильтрацией
    async getProjects() {
    try {
        const response = await fetch(`${this.baseURL}/p/api/e/user_projects/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": this.getCSRFToken()
            },
            credentials: "include"
        });
        if (!response.ok) {
            throw new Error("Ошибка загрузки проектов");
        }
        const projects = await response.json();
        // Возвращаем только id и title
        return projects.map(project => ({
            id: project.id,
            title: project.title
        }));
    } catch (error) {
        console.error("Ошибка запроса getProjects:", error);
        return [];
        }
    },

    // Получить список этапов проекта с фильтрацией
    async getStages(projectId) {
    try {
        const response = await fetch(`${this.baseURL}/p/api/e/project_stages/${projectId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": this.getCSRFToken()
            },
            credentials: "include"
        });
        if (!response.ok) {
            throw new Error("Ошибка загрузки этапов");
        }
        const stages = await response.json();
        // Возвращаем только id и title
        return stages.map(stage => ({
            id: stage.id,
            title: stage.title
        }));
    } catch (error) {
        console.error("Ошибка запроса getStages:", error);
        return [];
        }
    },

    // Получить файлы проекта (без изменений)
    async getProjectFiles(projectId) {
        try {
            const response = await fetch(`${this.baseURL}/p/api/e/project_files/${projectId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Ошибка загрузки файлов проекта");
            }

            const data = await response.json();

            // Формирование корректных ссылок для каждого файла
            return data.map(file => ({
                id: file.id,
                name: file.file_name, // Добавляем поле file_name
                filePath: file.file, // Путь к файлу на сервере
                fileUrl: `${this.baseURL}${file.file}`, // Формируем полный URL для скачивания
                createdAt: this.formatDate(file.created_at)
            }));
        } catch (error) {
            console.error("Ошибка запроса getProjectFiles:", error);
            return [];
        }
    },

    async getStageFiles(stageId) {
        try {
            const response = await fetch(`${this.baseURL}/p/api/e/stage_files/${stageId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Ошибка загрузки файлов этапа");
            }

            const data = await response.json();

            // Формирование корректных ссылок для каждого файла
            return data.map(file => ({
                id: file.id,
                name: file.file_name, // Добавляем поле file_name
                filePath: file.file, // Путь к файлу на сервере
                fileUrl: `${this.baseURL}${file.file}`, // Формируем полный URL для скачивания
                createdAt: this.formatDate(file.created_at) // Форматируем дату
            }));
        } catch (error) {
            console.error("Ошибка запроса getStageFiles:", error);
            return [];
        }
    },
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    },
    async downloadFile(fileId, fileName) {
        try {
            const response = await fetch(`${this.baseURL}/p/api/e/download_file/${fileId}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken() // Указываем CSRF токен для безопасности
                },
                credentials: "include", // Включаем куки для аутентификации
            });

            if (!response.ok) {
                throw new Error("Ошибка скачивания файла");
            }

            // Получаем файл как блоб
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Создаем элемент ссылки для скачивания
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName; // Используем переданное имя файла
            link.click(); // Имитируем клик по ссылке для скачивания

            // Освобождаем ресурс
            window.URL.revokeObjectURL(url);

            console.log("Файл успешно загружен!");
        } catch (error) {
            console.error("Ошибка при скачивании файла:", error);
        }
    },

    async uploadFile(fileData) {
    try {
        const formData = new FormData();

        // Append the file to the form data
        formData.append("file", fileData.File);

        // Append other form data (ProjectId, StageId)
        formData.append("project", fileData.ProjectId);
        formData.append("stage", fileData.StageId || "");

        const response = await fetch(`${this.baseURL}/p/api/e/upload_file/`, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": this.getCSRFToken() // Add CSRF token for security
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Error uploading file");
        }

        const result = await response.json();
        console.log("File uploaded successfully:", result.message);
    } catch (error) {
        console.error("Error uploading file:", error);
    }
},
    async getCustomerData() {
        try {
            // Выполнение GET-запроса на ручку для получения данных
            const response = await fetch(`${this.baseURL}/c/api/govs/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Ошибка загрузки данных о компаниях");
            }

            const data = await response.json();

            // Оставляем только нужные поля
            return data.map(customer => ({
                title: customer.title,
                inn: customer.inn,
                ogrn: customer.ogrn,
                phone: customer.phone
            }));
        } catch (error) {
            console.error("Ошибка запроса getCustomerData:", error);
            return [];
        }
    },
    async getContractorsData() {
        try {
            // Выполнение GET-запроса на ручку для получения данных
            const response = await fetch(`${this.baseURL}/c/api/subs/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Ошибка загрузки данных о компаниях");
            }

            const data = await response.json();

            // Оставляем только нужные поля
            return data.map(customer => ({
                title: customer.title,
                inn: customer.inn,
                ogrn: customer.ogrn,
                phone: customer.phone
            }));
        } catch (error) {
            console.error("Ошибка запроса getCustomerData:", error);
            return [];
        }
    },

    async ogrnSearch(ogrn) {
    try {
        const response = await fetch(`${this.baseURL}/c/api/gov_reg/${ogrn}`, {
            method: "GET",
            headers: {
                "X-CSRFToken": this.getCSRFToken(),
            },
            credentials: "include"
        });

        if (response.ok) {
                return "success";
         }
        else {
            return "not_found";
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
        return "error"; 
    }
}










};
