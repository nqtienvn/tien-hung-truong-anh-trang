const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ortus 3D Museum Multiplayer Server is running\n');
});

const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép kết nối từ mọi client (nhất là localhost:3000)
    methods: ['GET', 'POST']
  }
});

// Lưu trữ thông tin người chơi trực tuyến trong bộ nhớ
// Cấu trúc: { [socketId]: { id, nickname, galleryId, x, y, z, yaw } }
const activeUsers = {};

io.on('connection', (socket) => {
  console.log(`Du khách kết nối: ${socket.id}`);

  // 1. Khi người chơi tham gia phòng
  socket.on('join-room', (data) => {
    const { nickname, galleryId, x, y, z, yaw } = data;
    
    // Lưu thông tin người dùng mới
    const newUser = {
      id: socket.id,
      nickname: nickname || 'Anonymous',
      galleryId,
      x: x || 0,
      y: y || 1.7,
      z: z || 5,
      yaw: yaw || 0
    };

    activeUsers[socket.id] = newUser;
    socket.join(galleryId);
    console.log(`[JOIN] ${newUser.nickname} (${socket.id}) đã vào phòng ${galleryId}`);

    // Gửi danh sách toàn bộ người chơi trong phòng cho người mới
    const usersInRoom = Object.values(activeUsers).filter(u => u.galleryId === galleryId);
    socket.emit('users-list', usersInRoom);

    // Phát thông báo cho những người khác trong phòng
    socket.to(galleryId).emit('user-joined', newUser);
  });

  // 2. Khi người chơi di chuyển (Cập nhật vị trí liên tục)
  socket.on('move', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    user.x = data.x;
    user.y = data.y;
    user.z = data.z;
    user.yaw = data.yaw;

    // Phát sóng tọa độ mới cho những người dùng khác trong phòng
    socket.to(user.galleryId).emit('user-moved', user);
  });

  // 3. Khi người chơi gửi tin nhắn Chat
  socket.on('send-message', (data) => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const chatMsg = {
      userId: socket.id,
      nickname: user.nickname,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Phát tin nhắn cho những người khác trong cùng phòng
    socket.to(user.galleryId).emit('receive-message', chatMsg);
    console.log(`[CHAT] [Room ${user.galleryId}] ${user.nickname}: ${data.text}`);
  });

  // 4. Khi người chơi ngắt kết nối
  socket.on('disconnect', () => {
    const user = activeUsers[socket.id];
    if (user) {
      console.log(`[LEFT] ${user.nickname} (${socket.id}) đã thoát khỏi phòng ${user.galleryId}`);
      
      // Phát thông báo cho những người còn lại trong phòng
      socket.to(user.galleryId).emit('user-left', socket.id);
      
      // Xóa khỏi danh sách active
      delete activeUsers[socket.id];
    }
  });
});

const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`WebSocket server đang chạy trên cổng http://localhost:${PORT}`);
  console.log(`===================================================`);
});
