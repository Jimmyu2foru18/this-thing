const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

const createSupportTicket = async (req, res) => {
    try {
        const { subject, message, category, priority } = req.body;
        
        // Create ticket object
        const ticket = new SupportTicket({
            subject,
            message,
            user: req.user._id,
            category: category || 'other',
            priority: priority || 'medium',
            messages: [{
                sender: 'user',
                message,
                createdAt: Date.now()
            }]
        });
        
        const createdTicket = await ticket.save();
        
        res.status(201).json(createdTicket);
    } catch (error) {
        console.error('Error in createSupportTicket:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUserTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user._id })
            .sort({ updatedAt: -1 });
        
        res.json(tickets);
    } catch (error) {
        console.error('Error in getUserTickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        
        if (ticket.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this ticket' });
        }
        
        res.json(ticket);
    } catch (error) {
        console.error('Error in getTicketById:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

const addTicketMessage = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const isOwner = ticket.user.toString() === req.user._id.toString();
        const isAdmin = req.user.isAdmin;
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this ticket' });
        }
        
        const { message } = req.body;
        
        ticket.messages.push({
            sender: isAdmin ? 'admin' : 'user',
            message,
            createdAt: Date.now()
        });

        if (isAdmin && ticket.status === 'Open') {
            ticket.status = 'In-progress';
        }
        
        const updatedTicket = await ticket.save();
        
        res.json(updatedTicket);
    } catch (error) {
        console.error('Error in addTicketMessage:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }  
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update ticket status' });
        }
        
        const { status } = req.body;
        ticket.status = status;
        
        const updatedTicket = await ticket.save();
        
        res.json(updatedTicket);
    } catch (error) {
        console.error('Error in updateTicketStatus:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllTickets = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view all tickets' });
        }
        
        const { status, category, sort = 'createdAt', limit = 20, page = 1 } = req.query;
        const queryObj = {};

        if (status) {
            queryObj.status = status;
        }

        if (category) {
            queryObj.category = category;
        }

        let sortOrder = {};
        switch (sort) {
            case 'priority':
                sortOrder = { priority: -1, createdAt: -1 };
                break;
            case 'status':
                sortOrder = { status: 1, createdAt: -1 };
                break;
            case 'oldest':
                sortOrder = { createdAt: 1 };
                break;
            default:
                sortOrder = { createdAt: -1 };
        }

        const pageSize = Number(limit);
        const skip = (Number(page) - 1) * pageSize;
        const tickets = await SupportTicket.find(queryObj)
            .sort(sortOrder)
            .limit(pageSize)
            .skip(skip)
            .populate('user', 'username displayName email');
        
        const totalTickets = await SupportTicket.countDocuments(queryObj);
        
        res.json({
            tickets,
            page: Number(page),
            pages: Math.ceil(totalTickets / pageSize),
            total: totalTickets
        });
    } catch (error) {
        console.error('Error in getAllTickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createSupportTicket,
    getUserTickets,
    getTicketById,
    addTicketMessage,
    updateTicketStatus,
    getAllTickets
}; 