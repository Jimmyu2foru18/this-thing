const API_BASE_URL = '/api/support';

async function createSupportTicket(ticketData) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ticketData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to create support ticket'
            };
        }
        
        return {
            success: true,
            ticket: data
        };
    } catch (error) {
        console.error('Support ticket creation error:', error);
        return {
            success: false,
            message: 'Unable to connect to support service'
        };
    }
}

async function getUserTickets() {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch support tickets'
            };
        }
        
        return {
            success: true,
            tickets: data
        };
    } catch (error) {
        console.error('Support tickets fetch error:', error);
        return {
            success: false,
            message: 'Unable to connect to support service'
        };
    }
}

async function getTicketById(ticketId) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(`${API_BASE_URL}/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch support ticket'
            };
        }
        
        return {
            success: true,
            ticket: data
        };
    } catch (error) {
        console.error('Support ticket fetch error:', error);
        return {
            success: false,
            message: 'Unable to connect to support service'
        };
    }
}

async function addTicketMessage(ticketId, message) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(`${API_BASE_URL}/${ticketId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to add message'
            };
        }
        
        return {
            success: true,
            ticket: data
        };
    } catch (error) {
        console.error('Support ticket message error:', error);
        return {
            success: false,
            message: 'Unable to connect to support service'
        };
    }
}

async function updateTicketStatus(ticketId, status) {
    try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authorized'
            };
        }
        
        const response = await fetch(`${API_BASE_URL}/${ticketId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to update ticket status'
            };
        }
        
        return {
            success: true,
            ticket: data
        };
    } catch (error) {
        console.error('Support ticket status update error:', error);
        return {
            success: false,
            message: 'Unable to connect to support service'
        };
    }
}

async function getAllTickets(filters = {}) {
    try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authorized'
            };
        }
        
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        
        const url = `${API_BASE_URL}/admin/all?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch tickets'
            };
        }
        
        return {
            success: true,
            tickets: data.tickets,
            pagination: {
                page: data.page,
                pages: data.pages,
                total: data.total
            }
        };
    } catch (error) {
        console.error('Fetch all tickets error:', error);
        return {
            success: false,
            message: 'Unable to connect to support service'
        };
    }
}

export {
    createSupportTicket,
    getUserTickets,
    getTicketById,
    addTicketMessage,
    updateTicketStatus,
    getAllTickets
}; 