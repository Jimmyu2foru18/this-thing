
const DOM = {
	get(id) {
		const element = document.getElementById(id);
		if (!element) {
			console.warn(`Element with ID "${id}" not found`);
		}
		return element;
	},
	set(id, value, property = 'textContent') {
		const element = this.get(id);
		if (element) {
			element[property] = value === undefined || value === null ? '' : value;
		}
	},
	show(element) {
		if (typeof element === 'string') element = this.get(element);
		if (element) element.style.display = '';
	},
	hide(element) {
		if (typeof element === 'string') element = this.get(element);
		if (element) element.style.display = 'none';
	}
};

const ErrorHandler = {
	handleError(error, message = 'An error occurred') {
		console.error(error);
		return { success: false, message };
	}
};

const Notifications = {
	show(message, type = 'success', duration = 3000) {
		let toast = document.querySelector('.toast-message');
		
		if (!toast) {
			toast = document.createElement('div');
			toast.className = 'toast-message';
			document.body.appendChild(toast);
		}
		
		toast.textContent = message;
		toast.className = `toast-message ${type}`;
		toast.classList.add('show');
		
		setTimeout(() => {
			toast.classList.remove('show');
		}, duration);
	},
	success(message) {
		this.show(message, 'success');
	},
	error(message) {
		this.show(message, 'error');
	}
};

const Auth = {
	isAuthenticated() {
		return localStorage.getItem('userToken') !== null;
	},
	getToken() {
		return localStorage.getItem('userToken');
	},
	isAdmin() {
		return localStorage.getItem('isAdmin') === 'true';
	},
	signOut() {
		localStorage.removeItem('userToken');
		localStorage.removeItem('userId');
		localStorage.removeItem('username');
		localStorage.removeItem('displayName');
		localStorage.removeItem('isAuthenticated');
		localStorage.removeItem('isAdmin');
		localStorage.removeItem('adminToken');
		window.location.href = 'signin.html';
	}
};

const Api = {
	async request(url, options = {}) {
		try {
			if (Auth.isAuthenticated()) {
				options.headers = {
					...options.headers,
					'Authorization': `Bearer ${Auth.getToken()}`
				};
			}
			
			const response = await fetch(url, options);
			const data = await response.json();
			
			if (!response.ok) {
				return {
					success: false,
					message: data.message || 'Request failed'
				};
			}
			
			return {
				success: true,
				...data
			};
		} catch (error) {
			console.error('API Error:', error);
			return {
				success: false,
				message: 'Network error or service unavailable'
			};
		}
	},
	
	async get(url) {
		return this.request(url);
	},

	async post(url, data) {
		return this.request(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	},
	async put(url, data) {
		return this.request(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	},
	async delete(url) {
		return this.request(url, {
			method: 'DELETE'
		});
	}
};

const Forms = {
	getFormData(form) {
		const formData = new FormData(form);
		const data = {};
		
		formData.forEach((value, key) => {
			data[key] = value;
		});
		
		return data;
	},
	validateForm(form) {
		return form.checkValidity();
	},
	debounce(func, wait = 300) {
		let timeout;
		return function(...args) {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
		};
	}
};

export {
	DOM,
	ErrorHandler,
	Notifications,
	Auth,
	Api,
	Forms
}; 