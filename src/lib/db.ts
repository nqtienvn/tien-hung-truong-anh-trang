import fs from 'fs';
import path from 'path';

export interface Translation {
  vi: string;
  en: string;
}

export interface Gallery {
  id: string;
  name: string;
  description: string;
  scene_asset_url: string;
  is_active: boolean;
}

export interface Exhibit {
  id: string;
  gallery_id: string;
  title: Translation;
  author: Translation;
  description: Translation;
  model_3d_url: string;
  thumbnail_url: string;
  coordinate_x: number;
  coordinate_y: number;
  coordinate_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  scale_x: number;
  scale_y: number;
  scale_z: number;
}

interface DatabaseSchema {
  galleries: Gallery[];
  exhibits: Exhibit[];
}

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'db.json');

// Đọc dữ liệu từ file JSON
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Nếu file chưa tồn tại (đề phòng), trả về schema trống
      return { galleries: [], exhibits: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error('Lỗi đọc cơ sở dữ liệu:', error);
    return { galleries: [], exhibits: [] };
  }
}

// Ghi dữ liệu vào file JSON
function writeDb(data: DatabaseSchema): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Lỗi ghi cơ sở dữ liệu:', error);
    return false;
  }
}

// Memory Cache cho các API đọc (Mô phỏng Redis)
let dbCache: DatabaseSchema | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10000; // 10 giây TTL (Time to live) cho mục đích demo

function getCachedDb(): DatabaseSchema {
  const now = Date.now();
  if (dbCache && (now - cacheTimestamp < CACHE_TTL)) {
    // Cache Hit!
    return dbCache;
  }
  // Cache Miss, đọc từ file và lưu vào cache
  const db = readDb();
  dbCache = db;
  cacheTimestamp = now;
  return db;
}

function invalidateCache() {
  dbCache = null;
  cacheTimestamp = 0;
}

// --- PUBLIC HELPER METHODS ---

export function getGalleries(): Gallery[] {
  const db = getCachedDb();
  return db.galleries.filter(g => g.is_active);
}

export function getGalleryById(id: string): Gallery | undefined {
  const db = getCachedDb();
  return db.galleries.find(g => g.id === id);
}

export function getExhibits(galleryId?: string): Exhibit[] {
  const db = getCachedDb();
  if (galleryId) {
    return db.exhibits.filter(e => e.gallery_id === galleryId);
  }
  return db.exhibits;
}

export function getExhibitById(id: string): Exhibit | undefined {
  const db = getCachedDb();
  return db.exhibits.find(e => e.id === id);
}

export function updateExhibitCoordinates(
  id: string,
  coords: {
    coordinate_x: number;
    coordinate_y: number;
    coordinate_z: number;
    rotation_x: number;
    rotation_y: number;
    rotation_z: number;
    scale_x: number;
    scale_y: number;
    scale_z: number;
  }
): boolean {
  const db = readDb(); // Đọc trực tiếp từ file để tránh xung đột ghi đè
  const index = db.exhibits.findIndex(e => e.id === id);
  if (index === -1) return false;

  db.exhibits[index] = {
    ...db.exhibits[index],
    ...coords
  };

  const success = writeDb(db);
  if (success) {
    invalidateCache(); // Xóa cache để lượt đọc tiếp theo lấy dữ liệu mới nhất
  }
  return success;
}

export function saveExhibit(exhibit: Exhibit): boolean {
  const db = readDb();
  const index = db.exhibits.findIndex(e => e.id === exhibit.id);
  
  if (index !== -1) {
    db.exhibits[index] = exhibit;
  } else {
    db.exhibits.push(exhibit);
  }

  const success = writeDb(db);
  if (success) {
    invalidateCache();
  }
  return success;
}

export function deleteExhibit(id: string): boolean {
  const db = readDb();
  const initialLength = db.exhibits.length;
  db.exhibits = db.exhibits.filter(e => e.id !== id);
  
  if (db.exhibits.length === initialLength) return false;

  const success = writeDb(db);
  if (success) {
    invalidateCache();
  }
  return success;
}
