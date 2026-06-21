const http = require('http');
const { Server } = require('socket.io');

// Giới hạn số người tham quan đồng thời tối đa trong một phòng
const MAX_USERS_PER_ROOM = 30;

// Lưu trữ thông tin người chơi trực tuyến trong bộ nhớ
// Cấu trúc: { [socketId]: { id, nickname, galleryId, x, y, z, yaw } }
const activeUsers = {};

// Lưu trữ danh sách socket ID xếp hàng chờ cho từng phòng
// Cấu trúc: { [socketRoom]: [socketId1, socketId2, ...] }
const waitingQueues = {};

// ═══════════════════════════════════════════════════════════════════════════
// TRẠNG THÁI CỬA PHÒNG (Door States) — Admin điều khiển mở/đóng
// Cấu trúc: { [doorId]: { isOpen: boolean, targetRoom: string } }
// ═══════════════════════════════════════════════════════════════════════════
const doorStates = {};
const closingTimers = {};

// ═══════════════════════════════════════════════════════════════════════════
// TRẠNG THÁI PHÒNG TRIỂN LÃM (Room States) — Admin điều khiển bật/tắt (mở/đóng)
// Cấu trúc: { [roomId]: { isOpen: boolean } }
// ═══════════════════════════════════════════════════════════════════════════
const roomStates = {
  'gallery-paintings': { isOpen: true },
  'gallery-sculptures': { isOpen: true }
};

// Thời gian đếm ngược trước khi đóng cửa hoàn toàn (ms)
const DOOR_CLOSE_COUNTDOWN_MS = 5000;

// Hàm ánh xạ phòng triển lãm sang phòng socket hợp nhất
const getSocketRoom = (galleryId) => {
  // Tất cả phòng trong bảo tàng giờ chung 1 socket room (vì chúng nối liền nhau)
  return 'museum-unified';
};

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
    
    // Đếm số người hiện đang ở trong phòng hợp nhất (hoặc phòng tương ứng)
    const socketRoom = getSocketRoom(galleryId);
    const activeCount = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom).length;
    
    res.end(JSON.stringify({
      activeCount,
      limit: MAX_USERS_PER_ROOM
    }));
    return;
  }

  // API lấy trạng thái cửa
  if (req.url.startsWith('/door-status')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ doors: doorStates }));
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

  // Gửi trạng thái cửa hiện tại cho client mới kết nối
  socket.emit('door-states', doorStates);
  // Gửi trạng thái phòng hiện tại cho client mới kết nối
  socket.emit('room-states', roomStates);

  // 1. Khi người chơi tham gia phòng
  socket.on('join-room', (data) => {
    const { nickname, galleryId, x, y, z, yaw } = data;
    const socketRoom = getSocketRoom(galleryId);
    
    // Nếu chưa có nickname -> Chỉ cho phép quan sát (Spectator), không chiếm vị trí trong phòng
    if (!nickname) {
      socket.join(socketRoom);
      console.log(`[SPECTATE] Du khách ẩn danh (${socket.id}) đang quan sát phòng ${galleryId} (socket room: ${socketRoom}).`);
      
      // Gửi danh sách người chơi hiện tại cho spectator
      const usersInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);
      socket.emit('users-list', usersInRoom);
      return;
    }

    if (!waitingQueues[socketRoom]) {
      waitingQueues[socketRoom] = [];
    }

    // Đếm số người hiện đang ở trong phòng triển lãm này (hợp nhất)
    const activeInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);

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
      socket.join(socketRoom);
      console.log(`[JOIN] ${newUser.nickname} (${socket.id}) vào phòng ${galleryId} (socket: ${socketRoom}) trực tiếp. (${activeInRoom.length + 1}/${MAX_USERS_PER_ROOM})`);
      
      // Phản hồi thành công
      socket.emit('join-success');

      // Gửi danh sách toàn bộ người chơi trong phòng cho người mới
      const usersInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);
      socket.emit('users-list', usersInRoom);

      // Phát thông báo cho những người khác trong phòng
      socket.to(socketRoom).emit('user-joined', newUser);
    } else {
      // Phòng đầy -> Đưa vào hàng chờ
      if (!waitingQueues[socketRoom].includes(socket.id)) {
        waitingQueues[socketRoom].push(socket.id);
      }
      
      // Lưu tạm thông tin người dùng để duyệt vào sau này
      socket.tempUserData = newUser;

      const position = waitingQueues[socketRoom].indexOf(socket.id) + 1;
      console.log(`[QUEUE] ${newUser.nickname} (${socket.id}) xếp hàng chờ phòng ${galleryId} (socket: ${socketRoom}). Vị trí: #${position}`);

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

    // Cập nhật galleryId thời gian thực dựa vào tọa độ z để server biết user đang ở phòng nào
    if (data.z <= 8.0) {
      user.galleryId = 'lobby';
    } else if (data.z > 8.0 && data.z <= 58.0) {
      user.galleryId = 'gallery-paintings';
    } else if (data.z > 58.0 && data.z <= 108.0) {
      user.galleryId = 'gallery-sculptures';
    }

    const socketRoom = getSocketRoom(user.galleryId);
    // Phát sóng tọa độ mới cho những người dùng khác trong phòng
    socket.to(socketRoom).emit('user-moved', user);
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

    const socketRoom = getSocketRoom(user.galleryId);
    // Phát tin nhắn cho những người khác trong cùng phòng
    socket.to(socketRoom).emit('receive-message', chatMsg);
    console.log(`[CHAT] [Room ${user.galleryId}] (socket: ${socketRoom}) ${user.nickname}: ${data.text}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ADMIN: MỞ CỬA PHÒNG (Admin opens a door to a gallery room)
  // ═══════════════════════════════════════════════════════════════════════════
  socket.on('admin:open-door', (data) => {
    const { doorId, targetRoom } = data;
    console.log(`[ADMIN] Yêu cầu mở cửa "${doorId}" → phòng "${targetRoom}"`);

    // Kiểm tra điều kiện mở cửa: Cả 2 phòng liên quan đều phải đang bật (mở)
    // Sảnh (lobby) mặc định luôn bật.
    let canOpen = true;
    if (doorId === 'door-room1') {
      canOpen = roomStates['gallery-paintings']?.isOpen;
    } else if (doorId === 'door-room2') {
      canOpen = roomStates['gallery-paintings']?.isOpen && roomStates['gallery-sculptures']?.isOpen;
    } else if (doorId === 'door-room3') {
      canOpen = roomStates['gallery-sculptures']?.isOpen && roomStates['gallery-paintings']?.isOpen;
    }

    if (!canOpen) {
      socket.emit('admin:error', { message: 'Chỉ được mở cửa khi cả hai phòng liên quan đều đang bật!' });
      return;
    }

    // Hủy timer đóng cửa nếu có
    if (closingTimers[doorId]) {
      clearTimeout(closingTimers[doorId]);
      delete closingTimers[doorId];
    }

    doorStates[doorId] = {
      isOpen: true,
      targetRoom,
    };

    // Phát sóng cho tất cả client
    io.emit('door-opened', { doorId, targetRoom });
    // Gửi lại toàn bộ trạng thái cửa
    io.emit('door-states', doorStates);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ADMIN: ĐÓNG CỬA PHÒNG (Admin closes a door, teleport remaining players)
  // ═══════════════════════════════════════════════════════════════════════════
  socket.on('admin:close-door', (data) => {
    const { doorId, teleportTo } = data;
    // teleportTo: 'lobby' hoặc ID phòng mà admin chọn giữ lại
    console.log(`[ADMIN] Đóng cửa "${doorId}", teleport về "${teleportTo}"`);

    if (!doorStates[doorId]) {
      doorStates[doorId] = { isOpen: false, targetRoom: '' };
    }

    // Bước 1: Gửi cảnh báo đóng cửa (đếm ngược 5 giây)
    io.emit('door-closing', { 
      doorId, 
      teleportTo, 
      countdownMs: DOOR_CLOSE_COUNTDOWN_MS 
    });

    // Bước 2: Sau 5 giây, đóng cửa hoàn toàn
    const timer = setTimeout(() => {
      doorStates[doorId] = {
        isOpen: false,
        targetRoom: '',
      };

      if (closingTimers[doorId]) {
        delete closingTimers[doorId];
      }

      // Phát sóng cho tất cả client: Cửa đã đóng + teleport
      io.emit('door-closed', { doorId, teleportTo });
      io.emit('door-states', doorStates);

      console.log(`[ADMIN] Cửa "${doorId}" đã đóng hoàn toàn. Teleport → "${teleportTo}".`);
    }, DOOR_CLOSE_COUNTDOWN_MS);

    if (closingTimers[doorId]) {
      clearTimeout(closingTimers[doorId]);
    }
    closingTimers[doorId] = timer;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. ADMIN: LẤY TRẠNG THÁI CỬA VÀ PHÒNG
  // ═══════════════════════════════════════════════════════════════════════════
  socket.on('admin:get-door-status', () => {
    socket.emit('door-states', doorStates);
    socket.emit('room-states', roomStates);
  });

  socket.on('admin:toggle-room', (data) => {
    const { roomId, isOpen } = data;
    console.log(`[ADMIN] Yêu cầu chuyển phòng "${roomId}" sang: ${isOpen ? 'Bật' : 'Tắt'}`);

    if (!isOpen) {
      // Ràng buộc: Tất cả các cửa liên quan trực tiếp đến phòng này phải đang đóng
      const relatedDoors = [];
      if (roomId === 'gallery-paintings') {
        relatedDoors.push('door-room1', 'door-room2', 'door-room3');
      } else if (roomId === 'gallery-sculptures') {
        relatedDoors.push('door-room2', 'door-room3');
      }

      const isAnyDoorOpen = relatedDoors.some(doorId => doorStates[doorId]?.isOpen);
      if (isAnyDoorOpen) {
        socket.emit('admin:error', { message: 'Không thể tắt phòng khi cửa liên quan vẫn đang mở!' });
        return;
      }
    }

    roomStates[roomId] = { isOpen };

    // Phát sóng trạng thái mới cho toàn bộ client
    io.emit('room-states', roomStates);

    // Nếu tắt phòng, thực hiện gửi yêu cầu teleport cho những ai đang ở trong phòng bị tắt
    if (!isOpen) {
      let teleportTo = 'lobby';
      if (roomId === 'gallery-sculptures') {
        teleportTo = 'gallery-paintings';
      }
      io.emit('room-closed', { roomId, teleportTo });
      console.log(`[ADMIN] Đã phát lệnh teleport người chơi khỏi phòng bị tắt "${roomId}" về "${teleportTo}".`);
    }
  });

  // 7. Khi người chơi ngắt kết nối
  socket.on('disconnect', () => {
    // A. Nếu người dùng ngắt kết nối khi đang xếp hàng chờ
    for (const socketRoom in waitingQueues) {
      const idx = waitingQueues[socketRoom].indexOf(socket.id);
      if (idx !== -1) {
        waitingQueues[socketRoom].splice(idx, 1);
        console.log(`[QUEUE-LEFT] ${socket.id} đã thoát khỏi hàng chờ phòng (socket: ${socketRoom})`);

        // Cập nhật lại số thứ tự xếp hàng cho những người còn lại
        waitingQueues[socketRoom].forEach((sid, index) => {
          io.to(sid).emit('queue-status', { inQueue: true, position: index + 1, limit: MAX_USERS_PER_ROOM });
        });
      }
    }

    // B. Nếu người dùng ngắt kết nối khi đang ở trong phòng
    const user = activeUsers[socket.id];
    if (user) {
      const galleryId = user.galleryId;
      const socketRoom = getSocketRoom(galleryId);
      console.log(`[LEFT] ${user.nickname} (${socket.id}) đã thoát khỏi phòng ${galleryId} (socket: ${socketRoom})`);
      
      // Phát thông báo cho những người còn lại trong phòng
      socket.to(socketRoom).emit('user-left', socket.id);
      
      // Xóa khỏi danh sách active
      delete activeUsers[socket.id];

      // C. Tự động duyệt người đầu tiên trong hàng chờ (nếu có)
      if (waitingQueues[socketRoom] && waitingQueues[socketRoom].length > 0) {
        const nextSocketId = waitingQueues[socketRoom].shift();
        const nextSocket = io.sockets.sockets.get(nextSocketId);

        if (nextSocket && nextSocket.tempUserData) {
          const nextUser = nextSocket.tempUserData;

          // Thêm người chơi mới vào phòng hoạt động
          activeUsers[nextSocketId] = nextUser;
          nextSocket.join(socketRoom);
          console.log(`[QUEUE-ADMIT] ${nextUser.nickname} (${nextSocketId}) được duyệt vào phòng ${nextUser.galleryId} (socket: ${socketRoom}) từ hàng chờ.`);

          // Gửi thông báo phê duyệt
          nextSocket.emit('admitted');

          // Gửi danh sách toàn bộ người chơi trong phòng cho người mới
          const usersInRoom = Object.values(activeUsers).filter(u => getSocketRoom(u.galleryId) === socketRoom);
          nextSocket.emit('users-list', usersInRoom);

          // Phát thông báo cho những người khác trong phòng
          nextSocket.to(socketRoom).emit('user-joined', nextUser);
        }

        // Cập nhật lại số thứ tự xếp hàng cho những người còn lại
        waitingQueues[socketRoom].forEach((sid, index) => {
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
