import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io'; 
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
import projectModel from "./models/project.model.js"
import {generateResult} from "./services/gemini.service.js"
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
}); 

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization && socket.handshake.headers.authorization.split(' ')[1]);
    
    const projectId = socket.handshake.query.projectId
    if(!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Authentication error: Invalid project ID');
    }

     socket.project = await projectModel.findById(projectId);
    


    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication error: Invalid token'));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decode;

    next();
  } catch (e) {
    next(e);
  }
});

io.on('connection', socket => {
  socket.roomId = socket.project._id.toString();
  console.log('A user connected');
  socket.join(socket.roomId)
  socket.on('project-message', async data => {
    const message = data.message
    const aiIsPresentInMessage = message.includes('@ai') 
    if (aiIsPresentInMessage) {
      socket.broadcast.to(socket.roomId).emit("project-message", { ...data, isAi: false });
      const prompt = message.replace(/@ai/g, '').trim()
const result = await generateResult(prompt)
    
      
      io.to(socket.roomId).emit("project-message", {
        message: result,
        isAi: true,
      });
      return
    }
    
    console.log(data);
    socket.broadcast.to(socket.roomId).emit("project-message", {...data , isAi:false});
  })

  socket.on('event', data => {
    
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


