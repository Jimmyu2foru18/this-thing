const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SupportTicketSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [100, 'Subject cannot be more than 100 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['technical', 'account', 'feature', 'feedback', 'other'],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['Open', 'In-progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    messages: [MessageSchema],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    }
});

SupportTicketSchema.pre('save', function(next) {
    this.updatedAt = Date.now();

    if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
        this.resolvedAt = Date.now();
    }
    
    next();
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema); 