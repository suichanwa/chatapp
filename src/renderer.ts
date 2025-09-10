import './index.css';
import { ChatApp } from './renderer/ChatApp';

console.log('🔒 Secure Chat App starting...');

// Initialize the chat application
const app = new ChatApp();
app.initialize();