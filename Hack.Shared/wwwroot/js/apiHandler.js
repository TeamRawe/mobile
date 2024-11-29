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
        throw new Error("������ ��� �������� ��������: " + response.statusText);
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
                console.error("������ �������� ���������:", response.status, response.statusText);
                throw new Error("������ �������� ���������: " + response.statusText);
            }

            // ���������� ������ ���� title �� ������
            const data = await response.json();
            console.log(`��� ��������� (${customerId}):`, data.title); // �������� ������ title
            return data.title; // ���������� ������ title
        } catch (error) {
            console.error(`������ � getCustomerName ��� ID ${customerId}:`, error.message);
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

            // �������� ���������� �������
            if (!response.ok) {
                throw new Error(`������ �������: ${response.status} ${response.statusText}`);
            }

            // ������ ������
            const stages = await response.json();

            // ���� ��� ������, ���������� ������ ������
            if (!stages || stages.length === 0) {
                console.log('��� ������ ��� ������');
                return []; // ���������� ������ ������
            }

            return stages;
        } catch (error) {
            console.error('������ �������� ������ �� ������ �������:', error);
            return []; // ���������� ������ ������ � ������ ������
        }
    },
    async getWorkerName(workerId) {
        try {
            // ��������� URL ��� �������
            const apiUrl = `${this.baseURL}/c/api/subs/${workerId}/`;

            // ��������� ������
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": this.getCSRFToken() // ���� ����� CSRF-�����
                },
                credentials: "include" // ��� �������� cookies ������ � ��������
            });

            // ��������� ���������� ������
            if (!response.ok) {
                console.error(`������ ������� ��� ���������� ID ${workerId}: ${response.status} ${response.statusText}`);
                throw new Error(`������ �������: ${response.status} ${response.statusText}`);
            }

            // ������ ������ �� ������
            const workerData = await response.json();

            // ��������� ������� ���� title
            if (!workerData || !workerData.title) {
                console.error(`������ ��� ���������� ID ${workerId} ����������� ��� ����������� ���� title.`);
                return "����������� ���������"; // ���������� ��������� ������ null
            }

            // ���������� ���� title
            console.log(`�������� ���������� (${workerId}):`, workerData.title);
            return workerData.title;
        } catch (error) {
            console.error(`������ �������� ���������� ID ${workerId}:`, error.message);
            return "������ ��������"; // ���������� ��������� �� ������
        }
    },


    //               FOR          DOCUMENTS 

    // �������� ������ �������� � �����������
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
            throw new Error("������ �������� ��������");
        }
        const projects = await response.json();
        // ���������� ������ id � title
        return projects.map(project => ({
            id: project.id,
            title: project.title
        }));
    } catch (error) {
        console.error("������ ������� getProjects:", error);
        return [];
        }
    },

    // �������� ������ ������ ������� � �����������
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
            throw new Error("������ �������� ������");
        }
        const stages = await response.json();
        // ���������� ������ id � title
        return stages.map(stage => ({
            id: stage.id,
            title: stage.title
        }));
    } catch (error) {
        console.error("������ ������� getStages:", error);
        return [];
        }
    },

    // �������� ����� ������� (��� ���������)
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
                throw new Error("������ �������� ������ �������");
            }

            const data = await response.json();

            // ������������ ���������� ������ ��� ������� �����
            return data.map(file => ({
                id: file.id,
                name: file.file_name, // ��������� ���� file_name
                filePath: file.file, // ���� � ����� �� �������
                fileUrl: `${this.baseURL}${file.file}`, // ��������� ������ URL ��� ����������
                createdAt: this.formatDate(file.created_at)
            }));
        } catch (error) {
            console.error("������ ������� getProjectFiles:", error);
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
                throw new Error("������ �������� ������ �����");
            }

            const data = await response.json();

            // ������������ ���������� ������ ��� ������� �����
            return data.map(file => ({
                id: file.id,
                name: file.file_name, // ��������� ���� file_name
                filePath: file.file, // ���� � ����� �� �������
                fileUrl: `${this.baseURL}${file.file}`, // ��������� ������ URL ��� ����������
                createdAt: this.formatDate(file.created_at) // ����������� ����
            }));
        } catch (error) {
            console.error("������ ������� getStageFiles:", error);
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
                    "X-CSRFToken": this.getCSRFToken() // ��������� CSRF ����� ��� ������������
                },
                credentials: "include", // �������� ���� ��� ��������������
            });

            if (!response.ok) {
                throw new Error("������ ���������� �����");
            }

            // �������� ���� ��� ����
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // ������� ������� ������ ��� ����������
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName; // ���������� ���������� ��� �����
            link.click(); // ��������� ���� �� ������ ��� ����������

            // ����������� ������
            window.URL.revokeObjectURL(url);

            console.log("���� ������� ��������!");
        } catch (error) {
            console.error("������ ��� ���������� �����:", error);
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
            // ���������� GET-������� �� ����� ��� ��������� ������
            const response = await fetch(`${this.baseURL}/c/api/govs/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("������ �������� ������ � ���������");
            }

            const data = await response.json();

            // ��������� ������ ������ ����
            return data.map(customer => ({
                title: customer.title,
                inn: customer.inn,
                ogrn: customer.ogrn,
                phone: customer.phone
            }));
        } catch (error) {
            console.error("������ ������� getCustomerData:", error);
            return [];
        }
    },
    async getContractorsData() {
        try {
            // ���������� GET-������� �� ����� ��� ��������� ������
            const response = await fetch(`${this.baseURL}/c/api/subs/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": this.getCSRFToken()
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("������ �������� ������ � ���������");
            }

            const data = await response.json();

            // ��������� ������ ������ ����
            return data.map(customer => ({
                title: customer.title,
                inn: customer.inn,
                ogrn: customer.ogrn,
                phone: customer.phone
            }));
        } catch (error) {
            console.error("������ ������� getCustomerData:", error);
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
        console.error("������ �������:", error);
        return "error"; 
    }
}










};
