const http = require('http');
const { Server } = require('socket.io');

// Giới hạn số người tham quan đồng thời tối đa trong một phòng
const MAX_USERS_PER_ROOM = 30;

// Lưu trữ thông tin người chơi trực tuyến trong bộ nhớ
// Cấu trúc: { [socketId]: { id, nickname, galleryId, x, y, z, yaw } }
const activeUsers = {};

// Lưu trữ danh sách socket ID xếp hàng chờ cho từng phòng
// Cấu trúc: { [galleryId]: [socketId1, socketId2, ...] }
const waitingQueues = {};

const server = http.createServer((req, res) => {
  // CORS Headers để cho phép gọi API từ client ở cổng khác (cổng 3000) hoặc production URL
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API lấy thống kê số lượng người đang xem online
  if (req.url.startsWith('/stats')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    // Phân tích tham số query để lấy galleryId
    const urlParams = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const galleryId = urlParams.searchParams.get('galleryId') || 'gallery-paintings';
    
    // Đếm số người hiện đang ở trong phòng galleryId
    const activeCount = Object.values(activeUsers).filter(u => u.galleryId === galleryId).length;
    
    res.end(JSON.stringify({
      activeCount,
      limit: MAX_USERS_PER_ROOM
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ortus 3D Museum Multiplayer Server is running\n');
});

const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép kết nối từ mọi client (nhất là localhost:3000)
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Du khách kết nối: ${socket.id}`);

  // 1. Khi người chơi tham gia phòng
  socket.on('join-room', (data) => {
    const { nickname, galleryId, x, y, z, yaw } = data;
    
    // Nếu chưa có nickname -> Chỉ cho phép quan sát (Spectator), không chiếm vị trí trong phòng
    if (!nickname) {
      socket.join(galleryId);
      console.log(`[SPECTATE] Du khách ẩn danh (${socket.id}) đang quan sát phòng ${galleryId}.`);
      
      // Gửi danh sách người chơi hiện tại cho spectator
      const usersInRoom = Object.values(activeUsers).filter(u => u.galleryId === galleryId);
      socket.emit('users-list', usersInRoom);
      return;
    }

    if (!waitingQueues[galleryId]) {
      waitingQueues[galleryId] = [];
    }

    // Đếm số người hiện đang ở trong phòng triển lãm này
    const activeInRoom = Object.values(activeUsers).filter(u => u.galleryId === galleryId);

    // Lưu thông tin người dùng mới
    const newUser = {
      id: socket.id,
      nickname: nickname !== undefined ? nickname : 'Anonymous',
      galleryId,
      x: x || 0,
      y: y || 1.7,
      z: z || 5,
      yaw: yaw || 0
    };

    if (activeInRoom.length < MAX_USERS_PER_ROOM) {
      // Cho phép vào phòng trực tiếp
      activeUsers[socket.id] = newUser;
      socket.join(galleryId);
      console.log(`[JOIN] ${newUser.nickname} (${socket.id}) vào phòng ${galleryId} trực tiếp. (${activeInRoom.length + 1}/${MAX_USERS_PER_ROOM})`);
      
      // Phản hồi thành công
      socket.emit('join-success');

      // Gửi danh sách toàn bộ người chơi trong phòng cho người mới
      const usersInRoom = Object.values(activeUsers).filter(u => u.galleryId === galleryId);
      socket.emit('users-list', usersInRoom);

      // Phát thông báo cho những người khác trong phòng
      socket.to(galleryId).emit('user-joined', newUser);
    } else {
      // Phòng đầy -> Đưa vào hàng chờ
      if (!waitingQueues[galleryId].includes(socket.id)) {
        waitingQueues[galleryId].push(socket.id);
      }
      
      // Lưu tạm thông tin người dùng để duyệt vào sau này
      socket.tempUserData = newUser;

      const position = waitingQueues[galleryId].indexOf(socket.id) + 1;
      console.log(`[QUEUE] ${newUser.nickname} (${socket.id}) xếp hàng chờ phòng ${galleryId}. Vị trí: #${position}`);

      // Gửi vị trí xếp hàng thời gian thực
      socket.emit('queue-status', { inQueue: true, position, limit: MAX_USERS_PER_ROOM });
    }
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
    // A. Nếu người dùng ngắt kết nối khi đang xếp hàng chờ
    for (const galleryId in waitingQueues) {
      const idx = waitingQueues[galleryId].indexOf(socket.id);
      if (idx !== -1) {
        waitingQueues[galleryId].splice(idx, 1);
        console.log(`[QUEUE-LEFT] ${socket.id} đã thoát khỏi hàng chờ phòng ${galleryId}`);

        // Cập nhật lại số thứ tự xếp hàng cho những người còn lại
        waitingQueues[galleryId].forEach((sid, index) => {
          io.to(sid).emit('queue-status', { inQueue: true, position: index + 1, limit: MAX_USERS_PER_ROOM });
        });
      }
    }

    // B. Nếu người dùng ngắt kết nối khi đang ở trong phòng
    const user = activeUsers[socket.id];
    if (user) {
      const galleryId = user.galleryId;
      console.log(`[LEFT] ${user.nickname} (${socket.id}) đã thoát khỏi phòng ${galleryId}`);
      
      // Phát thông báo cho những người còn lại trong phòng
      socket.to(galleryId).emit('user-left', socket.id);
      
      // Xóa khỏi danh sách active
      delete activeUsers[socket.id];

      // C. Tự động duyệt người đầu tiên trong hàng chờ (nếu có)
      if (waitingQueues[galleryId] && waitingQueues[galleryId].length > 0) {
        const nextSocketId = waitingQueues[galleryId].shift();
        const nextSocket = io.sockets.sockets.get(nextSocketId);

        if (nextSocket && nextSocket.tempUserData) {
          const nextUser = nextSocket.tempUserData;

          // Thêm người chơi mới vào phòng hoạt động
          activeUsers[nextSocketId] = nextUser;
          nextSocket.join(galleryId);
          console.log(`[QUEUE-ADMIT] ${nextUser.nickname} (${nextSocketId}) được duyệt vào phòng ${galleryId} từ hàng chờ.`);

          // Gửi thông báo phê duyệt
          nextSocket.emit('admitted');

          // Gửi danh sách toàn bộ người chơi trong phòng cho người mới
          const usersInRoom = Object.values(activeUsers).filter(u => u.galleryId === galleryId);
          nextSocket.emit('users-list', usersInRoom);

          // Phát thông báo cho những người khác trong phòng
          nextSocket.to(galleryId).emit('user-joined', nextUser);
        }

        // Cập nhật lại số thứ tự xếp hàng cho những người còn lại
        waitingQueues[galleryId].forEach((sid, index) => {
          io.to(sid).emit('queue-status', { inQueue: true, position: index + 1, limit: MAX_USERS_PER_ROOM });
        });
      }
    }
  });
});

const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`WebSocket server đang chạy trên cổng http://localhost:${PORT}`);
  console.log(`===================================================`);
});
