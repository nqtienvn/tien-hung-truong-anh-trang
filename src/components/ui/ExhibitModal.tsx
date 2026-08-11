'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Globe, User, BookOpen, Gamepad2, HelpCircle, Check, AlertTriangle, ArrowRight, Save, Clock, Volume2, Pause, Play } from 'lucide-react';
import { useMuseum } from '@/context/MuseumContext';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number | number[]; // index (hoặc mảng index nếu chọn nhiều)
  isMulti?: boolean;
}

interface GameplayData {
  hasTimer: boolean;
  timerDuration: number;
  quizzes: QuizQuestion[];
  historyText: string;
  clueText: string;
}

const GAMEPLAY_DICTIONARY: Record<string, GameplayData> = {
  'exhibit-coupon': {
    hasTimer: true,
    timerDuration: 10,
    quizzes: [
      {
        question: 'Nguyễn Tất Thành rời Tổ quốc tìm đường cứu nước vào thời gian nào?',
        options: [
          'Ngày 5/6/1911',
          'Ngày 3/2/1930',
          'Ngày 2/9/1945',
          'Ngày 19/5/1890'
        ],
        correctIndex: 0
      },
      {
        question: 'Sự kiện Nguyễn Tất Thành ra đi từ Bến Nhà Rồng có ý nghĩa gì?',
        options: [
          'Mở đầu công cuộc xây dựng đất nước sau chiến tranh',
          'Đánh dấu sự thành lập một tổ chức chính trị mới',
          'Là điểm khởi đầu của hành trình tìm đường cứu nước',
          'Kết thúc các phong trào cứu nước đương thời'
        ],
        correctIndex: 2
      }
    ],
    historyText: 'NGƯỜI RA ĐI — Bến Nhà Rồng – 05/06/1911. Ngày 5/6/1911, từ Bến Nhà Rồng, người thanh niên Nguyễn Tất Thành rời Tổ quốc trên tàu Amiral Latouche-Tréville. Trong bối cảnh các phong trào cứu nước đương thời chưa tìm được con đường giải phóng dân tộc phù hợp, Nguyễn Tất Thành quyết định ra nước ngoài để tìm hiểu thế giới và tìm một con đường mới cho dân tộc Việt Nam. Ý nghĩa: Đây là điểm khởi đầu của hành trình tìm đường cứu nước.',
    clueText: 'BẾN NHÀ RỒNG · 1911 · RA ĐI'
  },
  'exhibit-world-1911-1917': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Trong giai đoạn 1911–1917, trải nghiệm thực tiễn giúp Nguyễn Tất Thành nhận ra điều gì?',
        options: [
          'Sự áp bức chỉ tồn tại tại Việt Nam',
          'Nhân dân thuộc địa ở nhiều nơi đều chịu áp bức và bóc lột',
          'Người lao động tại các nước tư bản đều có cuộc sống sung túc',
          'Các nước thuộc địa không có điểm chung với nhau'
        ],
        correctIndex: 1
      },
      {
        question: 'Cuối năm 1917, Nguyễn Tất Thành trở lại Pháp và bước sang giai đoạn nào?',
        options: [
          'Ngừng tìm hiểu tình hình thế giới để trở về Việt Nam',
          'Chỉ tiếp tục làm việc trên các tàu biển',
          'Từ quan sát, trải nghiệm sang tham gia tích cực hơn vào hoạt động chính trị',
          'Rời châu Âu để định cư lâu dài tại Hoa Kỳ'
        ],
        correctIndex: 2
      }
    ],
    historyText: 'NHÌN RA THẾ GIỚI — 1911–1917. Sau khi rời Bến Nhà Rồng năm 1911, Nguyễn Tất Thành bắt đầu hành trình quan sát và tìm hiểu thế giới. Trên đường sang Pháp, Người đi qua Singapore, Colombo, Port Said rồi đến Marseille. Năm 1912, Người tiếp tục qua Tây Ban Nha, Bồ Đào Nha và nhiều vùng thuộc địa ở châu Phi. Cuối năm 1912, Người đến Hoa Kỳ; khoảng cuối năm 1913, Người sang Anh và sống, lao động tại đây đến khoảng năm 1917. Cuối năm 1917, Người trở lại Pháp, chuyển từ chủ yếu quan sát và trải nghiệm thực tế sang tham gia ngày càng tích cực vào các hoạt động chính trị. Ý nghĩa: Sáu năm đi qua nhiều quốc gia và châu lục giúp Người nhận ra sự áp bức không chỉ tồn tại ở Việt Nam, từng bước phân biệt nhân dân lao động với các lực lượng thực dân và nhận thức sự gần gũi giữa các dân tộc bị áp bức.',
    clueText: 'PHÁP · CHÂU PHI · HOA KỲ · ANH · LAO ĐỘNG · QUAN SÁT'
  },
  'exhibit-versailles-1919': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Nội dung chính của 8 điểm trong “Yêu sách của nhân dân An Nam” là gì?',
        options: [
          'Yêu cầu giành độc lập hoàn toàn ngay lập tức',
          'Đòi các quyền tự do, dân chủ và bình đẳng cơ bản cho người Việt Nam',
          'Đề nghị Pháp mở rộng hoạt động thương mại tại Việt Nam',
          'Yêu cầu thành lập một liên minh quân sự mới'
        ],
        correctIndex: 1
      },
      {
        question: 'Việc các cường quốc không đáp ứng bản yêu sách giúp Nguyễn Ái Quốc nhận thức rõ điều gì?',
        options: [
          'Các dân tộc thuộc địa có thể hoàn toàn trông chờ vào lời hứa của các cường quốc',
          'Chỉ cần tiếp tục gửi thêm yêu sách là có thể giành độc lập',
          'Muốn giải phóng dân tộc phải tìm con đường hiệu quả hơn, không phụ thuộc vào sự ban phát của các nước đế quốc',
          'Hoạt động chính trị tại diễn đàn quốc tế không có bất kỳ ý nghĩa nào'
        ],
        correctIndex: 2
      }
    ],
    historyText: 'TIẾNG NÓI CỦA MỘT DÂN TỘC — Paris, 18/06/1919. Nguyễn Ái Quốc gửi Yêu sách của nhân dân An Nam gồm 8 điểm tới Hội nghị Versailles, đòi các quyền tự do, dân chủ và bình đẳng cơ bản cho người Việt Nam. Các yêu cầu không được đáp ứng, giúp Người nhận thức rõ rằng các dân tộc thuộc địa không thể chỉ trông chờ vào sự ban phát của các cường quốc và cần tìm một con đường giải phóng hiệu quả hơn.',
    clueText: 'VERSAILLES 1919 · NGUYỄN ÁI QUỐC · 8 ĐIỂM YÊU SÁCH · TỰ DO · DÂN CHỦ · BÌNH ĐẲNG'
  },
  'exhibit-lenin-theses-1920': {
    hasTimer: true,
    timerDuration: 10,
    quizzes: [
      {
        question: 'Luận cương của V.I. Lênin mà Nguyễn Ái Quốc đọc tháng 7/1920 đề cập trực tiếp đến vấn đề nào?',
        options: [
          'Vấn đề dân tộc và thuộc địa',
          'Cải cách hệ thống giáo dục tại Pháp',
          'Phát triển thương mại giữa các nước châu Âu',
          'Tổ chức lại Hội nghị Versailles'
        ],
        correctIndex: 0
      },
      {
        question: 'Sau khi tiếp cận Luận cương của Lênin, Nguyễn Ái Quốc xác định phương hướng nào cho sự nghiệp giải phóng dân tộc?',
        options: [
          'Tiếp tục trông chờ sự giúp đỡ của các cường quốc đế quốc',
          'Đi theo con đường cách mạng vô sản, gắn với lực lượng cách mạng của quần chúng',
          'Chỉ đấu tranh bằng cách gửi yêu sách tới các hội nghị quốc tế',
          'Tách cuộc đấu tranh của Việt Nam khỏi phong trào cách mạng thế giới'
        ],
        correctIndex: 1
      }
    ],
    historyText: 'ÁNH SÁNG CỦA CON ĐƯỜNG — Paris, tháng 7/1920. Nguyễn Ái Quốc đọc Sơ thảo lần thứ nhất những luận cương về vấn đề dân tộc và vấn đề thuộc địa của V.I. Lênin. Luận cương giúp Người xác định con đường cách mạng vô sản là phương hướng cơ bản để giải phóng dân tộc Việt Nam, đánh dấu bước ngoặt quyết định về tư tưởng sau gần một thập kỷ tìm tòi và khảo nghiệm thực tiễn.',
    clueText: 'LUẬN CƯƠNG LÊNIN · DÂN TỘC & THUỘC ĐỊA · 1920 · CÁCH MẠNG VÔ SẢN'
  },
  'exhibit-tours-1920': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Tại Đại hội Tours tháng 12/1920, Nguyễn Ái Quốc đã đưa ra lựa chọn nào?',
        options: [
          'Phản đối việc gia nhập Quốc tế Cộng sản',
          'Bỏ phiếu tán thành gia nhập Quốc tế III',
          'Rời Đảng Xã hội Pháp để trở về Việt Nam ngay lập tức',
          'Tiếp tục chỉ gửi yêu sách tới các cường quốc'
        ],
        correctIndex: 1
      },
      {
        question: 'Sự lựa chọn tại Đại hội Tours đánh dấu bước chuyển biến nào của Nguyễn Ái Quốc?',
        options: [
          'Từ một người yêu nước đang tìm đường trở thành một người cộng sản',
          'Từ hoạt động chính trị chuyển hoàn toàn sang hoạt động thương mại',
          'Từ ủng hộ cách mạng vô sản chuyển sang dựa vào các nước đế quốc',
          'Từ đấu tranh quốc tế chuyển sang từ bỏ mục tiêu giải phóng dân tộc'
        ],
        correctIndex: 0
      }
    ],
    historyText: 'SỰ LỰA CHỌN LỊCH SỬ — Tours, Pháp, tháng 12/1920. Nguyễn Ái Quốc tham dự Đại hội lần thứ XVIII của Đảng Xã hội Pháp, bỏ phiếu tán thành gia nhập Quốc tế Cộng sản và trở thành một trong những thành viên tham gia sáng lập Đảng Cộng sản Pháp. Sự kiện đánh dấu bước chuyển từ một người yêu nước đang tìm kiếm con đường cứu nước thành một người cộng sản, chính thức lựa chọn con đường cách mạng vô sản để giải phóng dân tộc.',
    clueText: 'ĐẠI HỘI TOURS · QUỐC TẾ III · ĐẢNG CỘNG SẢN PHÁP · CÁCH MẠNG VÔ SẢN · LỰA CHỌN'
  },
  'exhibit-guangzhou-1925-1927': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Tháng 6/1925 tại Quảng Châu, Nguyễn Ái Quốc thành lập tổ chức nào?',
        options: [
          'Hội Việt Nam Cách mạng Thanh niên',
          'Đảng Xã hội Pháp',
          'Quốc tế Cộng sản',
          'Đảng Cộng sản Pháp'
        ],
        correctIndex: 0
      },
      {
        question: 'Các hoạt động của Nguyễn Ái Quốc tại Quảng Châu nhằm chuẩn bị những mặt nào cho cách mạng Việt Nam?',
        options: [
          'Chỉ chuẩn bị nguồn tài chính và vũ khí',
          'Tư tưởng, chính trị, cán bộ và tổ chức',
          'Chỉ tập trung vào hoạt động ngoại giao',
          'Chỉ nghiên cứu tình hình kinh tế Trung Quốc'
        ],
        correctIndex: 1
      }
    ],
    historyText: 'CHUẨN BỊ CHO CÁCH MẠNG — Quảng Châu, Trung Quốc, 1925–1927. Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên, tổ chức các lớp huấn luyện chính trị, đào tạo cán bộ và truyền bá chủ nghĩa Mác – Lênin vào Việt Nam. Các bài giảng được tập hợp và xuất bản thành Đường Kách Mệnh năm 1927, góp phần chuẩn bị về tư tưởng, chính trị, cán bộ và tổ chức cho cách mạng Việt Nam.',
    clueText: 'QUẢNG CHÂU · HỘI VIỆT NAM CÁCH MẠNG THANH NIÊN · HUẤN LUYỆN CÁN BỘ · ĐƯỜNG KÁCH MỆNH · CHUẨN BỊ TỔ CHỨC'
  },
  'exhibit-convergence-1930': {
    hasTimer: true,
    timerDuration: 10,
    quizzes: [
      {
        question: 'Vì sao việc thống nhất các tổ chức cộng sản trở nên cấp thiết vào cuối năm 1929?',
        options: [
          'Vì các tổ chức hoạt động riêng rẽ, tranh giành ảnh hưởng và thiếu sự lãnh đạo thống nhất',
          'Vì phong trào công nhân và phong trào yêu nước đã hoàn toàn chấm dứt',
          'Vì Việt Nam lúc đó chưa có bất kỳ tổ chức cộng sản nào',
          'Vì Quốc tế Cộng sản yêu cầu giải thể toàn bộ lực lượng cách mạng'
        ],
        correctIndex: 0
      },
      {
        question: 'Nguyễn Ái Quốc đến Hồng Kông đầu năm 1930 để thực hiện nhiệm vụ gì?',
        options: [
          'Thành lập thêm một tổ chức cộng sản hoạt động riêng rẽ',
          'Triệu tập và chủ trì hội nghị nhằm thống nhất các tổ chức cộng sản',
          'Tổ chức một hội nghị thương mại quốc tế',
          'Chấm dứt hoạt động của phong trào cách mạng Việt Nam'
        ],
        correctIndex: 1
      }
    ],
    historyText: 'HỘI TỤ — Việt Nam – Hồng Kông, 1929–1930. Năm 1929, ba tổ chức cộng sản lần lượt xuất hiện nhưng tồn tại riêng rẽ, tranh giành ảnh hưởng và thiếu sự lãnh đạo thống nhất. Với tư cách đại diện Quốc tế Cộng sản, Nguyễn Ái Quốc từ Xiêm đến Hồng Kông để triệu tập và chủ trì một hội nghị nhằm thống nhất các tổ chức cộng sản, mở đường cho sự thành lập Đảng Cộng sản Việt Nam.',
    clueText: '1929 · BA TỔ CHỨC CỘNG SẢN · PHÂN TÁN · THỐNG NHẤT · HỒNG KÔNG 1930'
  }
};

const CERAMIC_EVENTS_MAP: Record<string, { vi: string; en: string }> = {
  'vn-left-1': { vi: 'Đại hội VI - Đổi mới', en: '6th Party Congress - Doi Moi' },
  'vn-left-2': { vi: 'Khoán 10', en: 'Resolution 10 (Khoan 10)' },
  'vn-left-3': { vi: 'Việt Nam rút quân khỏi Campuchia', en: 'Withdrawal from Cambodia' },
  'vn-right-1': { vi: 'Việt Nam trở thành nước xuất khẩu gạo', en: 'VN becomes a major rice exporter' },
  'vn-back-left': { vi: 'Liên Xô tan rã', en: 'Soviet Union dissolution' },
  'vn-right-2': { vi: 'Hoa Kỳ bãi bỏ cấm vận', en: 'US lifts trade embargo' },
  'vn-right-3': { vi: 'Bình thường hóa quan hệ Việt Nam – Hoa Kỳ', en: 'Normalization of US-VN relations' },
  'vn-door-left': { vi: 'Việt Nam gia nhập ASEAN', en: 'VN joins ASEAN' },
  'vn-door-right': { vi: 'Nhật thực toàn phần tại Việt Nam', en: 'Total solar eclipse in Vietnam' }
};

export const ExhibitModal: React.FC = () => {
  const {
    selectedExhibit,
    setSelectedExhibit,
    language,
    setLanguage,
    audioPlaying,
    setAudioPlaying,
    setMiniGameOpen,
    gameState: globalGameState,
    initializeGame,
    cluesCollected,
    addClue,
    activeGallery,
    exhibitModalMode,
    nickname,
    collectedCeramics,
    addCeramic,
  } = useMuseum();

  // --- States cho Audio thuyết minh mặc định ---
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(150);
  // --- States cho phòng gốm sứ (gallery-ceramics) ---
  const isCeramicsRoom = activeGallery?.id === 'gallery-ceramics';
  const [ceramicsCountdown, setCeramicsCountdown] = useState(10);

  // --- States cho gameplay Hành trình tìm đường (gallery-subsidy) ---
  const isSubsidyRoom = activeGallery?.id === 'gallery-subsidy';
  const gameData = selectedExhibit ? GAMEPLAY_DICTIONARY[selectedExhibit.id] : null;

  const [gameState, setGameState] = useState<'observe' | 'quiz' | 'info'>('observe');
  const effectiveGameState = exhibitModalMode === 'info' ? 'info' : gameState;
  const [countdown, setCountdown] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]); // Cho chi-choice
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [canCollectCurrentClue, setCanCollectCurrentClue] = useState(false);
  const [failedQuizIds, setFailedQuizIds] = useState<string[]>([]);

  // Tải danh sách câu hỏi đã làm sai từ localStorage để lưu trữ vĩnh viễn không bị reset khi load lại trang
  useEffect(() => {
    if (typeof window !== 'undefined' && nickname) {
      const saved = localStorage.getItem(`failed_quizzes_${nickname}`);
      if (saved) {
        try {
          setFailedQuizIds(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [nickname]);

  const updateFailedQuizIds = (newFailed: string[]) => {
    setFailedQuizIds(newFailed);
    if (typeof window !== 'undefined' && nickname) {
      localStorage.setItem(`failed_quizzes_${nickname}`, JSON.stringify(newFailed));
    }
  };

  const lastExhibitIdRef = useRef<string | null>(null);

  // Reset audio & gameplay states chỉ khi thay đổi hiện vật mở lên (tránh reset giữa chừng khi làm bài sai)
  useEffect(() => {
    if (!selectedExhibit) {
      lastExhibitIdRef.current = null;
      return;
    }

    // Nếu vẫn là hiện vật cũ đang mở thì không reset lại trạng thái đang làm bài
    if (selectedExhibit.id === lastExhibitIdRef.current) return;
    lastExhibitIdRef.current = selectedExhibit.id;

    setAudioProgress(0);
    setAudioPlaying(false);

    const length = selectedExhibit.id.length * 7 + 80;
    setAudioDuration(length);

    if (isCeramicsRoom) {
      setCeramicsCountdown(10);
    }

    if (isSubsidyRoom && gameData) {
      const alreadyCollected = cluesCollected.includes(selectedExhibit.id);

      // Bảng thông tin chỉ mở tư liệu; hiện vật đã thu thập cũng không cần làm lại quiz.
      // Hiện vật chưa thu thập luôn được phép thử câu hỏi lại để tránh khóa tiến trình RoomOne.
      if (exhibitModalMode === 'info' || alreadyCollected) {
        setGameState('info');
        setCanCollectCurrentClue(false);
        return;
      }

      setGameState(gameData.hasTimer ? 'observe' : 'quiz');
      setCountdown(gameData.timerDuration);
      setCurrentQuizIndex(0);
      setSelectedOption(null);
      setSelectedOptions([]);
      setAnswerChecked(false);
      setIsCorrect(false);
      setCanCollectCurrentClue(false);
    }
  }, [selectedExhibit?.id, cluesCollected, failedQuizIds, isSubsidyRoom, isCeramicsRoom, gameData, exhibitModalMode]);

  // Bộ đếm ngược 10 giây cho phòng gốm sứ
  useEffect(() => {
    if (isCeramicsRoom && selectedExhibit && !collectedCeramics.includes(selectedExhibit.id) && ceramicsCountdown > 0) {
      const timer = setTimeout(() => {
        setCeramicsCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCeramicsRoom, selectedExhibit, collectedCeramics, ceramicsCountdown]);

  // Bộ đếm ngược thời gian quan sát hiện vật
  useEffect(() => {
    if (exhibitModalMode === 'info') return;

    if (isSubsidyRoom && gameState === 'observe' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSubsidyRoom && gameState === 'observe' && countdown === 0 && gameData) {
      setGameState('quiz');
    }
  }, [gameState, countdown, gameData, isSubsidyRoom, exhibitModalMode]);

  // Mô phỏng Audio thuyết minh chạy giây tăng dần
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (audioPlaying) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= audioDuration) {
            setAudioPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [audioPlaying, audioDuration, setAudioPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Xử lý logic Quiz game ---
  const currentQuiz = gameData?.quizzes[currentQuizIndex];
  const shuffledOptions = useMemo(() => {
    if (!currentQuiz || !selectedExhibit) return [];

    const seedText = `${nickname}-${selectedExhibit.id}-${currentQuizIndex}`;
    let seed = 0;
    for (let i = 0; i < seedText.length; i += 1) {
      seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    }

    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    return currentQuiz.options
      .map((text, originalIndex) => ({ text, originalIndex }))
      .sort(() => random() - 0.5);
  }, [currentQuiz, currentQuizIndex, nickname, selectedExhibit]);

  if (!selectedExhibit) return null;

  const titleText = language === 'vi' ? selectedExhibit.title.vi : selectedExhibit.title.en;
  const authorText = language === 'vi' ? selectedExhibit.author.vi : selectedExhibit.author.en;
  const descriptionText = language === 'vi' ? selectedExhibit.description.vi : selectedExhibit.description.en;

  const handleSelectOption = (idx: number) => {
    if (answerChecked) return;
    if (currentQuiz?.isMulti) {
      setSelectedOptions(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      setSelectedOption(idx);
    }
  };

  const handleCheckAnswer = () => {
    if (!currentQuiz) return;

    let correct = false;
    if (currentQuiz.isMulti) {
      const correctIdxs = currentQuiz.correctIndex as number[];
      correct = selectedOptions.length === correctIdxs.length &&
        selectedOptions.every(val => correctIdxs.includes(val));
    } else {
      correct = selectedOption === currentQuiz.correctIndex;
    }

    setIsCorrect(correct);
    setAnswerChecked(true);
    setCanCollectCurrentClue(correct);

    if (!correct && selectedExhibit) {
      const newFailed = failedQuizIds.includes(selectedExhibit.id)
        ? failedQuizIds
        : [...failedQuizIds, selectedExhibit.id];
      updateFailedQuizIds(newFailed);
    }
  };

  const handleNextStep = () => {
    if (!gameData) return;

    if (currentQuizIndex < gameData.quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setSelectedOptions([]);
      setAnswerChecked(false);
      setIsCorrect(false);
    } else {
      setGameState('info');
    }
  };

  const handleCollectClue = () => {
    addClue(selectedExhibit.id);
    setSelectedExhibit(null); // Đóng modal sau khi thu thập
  };

  return (
    <div className="absolute inset-x-4 top-16 bottom-16 z-50 flex items-center justify-center pointer-events-none select-none">
      <div className="w-full max-w-7xl h-full bg-slate-950/92 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row text-slate-100 transition-all duration-300 pointer-events-auto">
        {/* Ảnh xem trước lớn bên trái */}
        <div className="relative h-[38vh] lg:h-full lg:w-[48%] xl:w-[52%] bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 flex items-center justify-center">
          {(() => {
            const thumbnailUrl = selectedExhibit.id === 'vn-back-right'
              ? '/exhibits/anhgame.jpg'
              : selectedExhibit.thumbnail_url;
            return thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={titleText}
                className="w-full h-full object-contain lg:object-cover opacity-95 bg-slate-950"
                style={{
                  objectPosition: 'center'
                }}
              />
            ) : (
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-24 h-24 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                  <Gamepad2 size={48} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-wide">{titleText}</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm">
                    {language === 'vi' 
                      ? 'Trò chơi tương tác tìm hiểu lịch sử trực quan của phòng trưng bày.' 
                      : 'Interactive game to explore the gallery\'s visual history.'}
                  </p>
                </div>
              </div>
            );
          })()}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/85 via-slate-950/10 to-transparent pointer-events-none" />

          {/* Nhãn loại hiện vật */}
          <span className="absolute bottom-5 left-5 bg-amber-500/20 text-amber-200 border border-amber-500/35 text-[11px] font-bold tracking-widest px-3 py-1.5 rounded-lg uppercase font-sans">
            {isSubsidyRoom ? 'Theo dấu chân Người' : (selectedExhibit.model_3d_url ? 'Điêu Khắc 3D' : 'Hội Họa 2D')}
          </span>
        </div>

        {/* Nội dung chi tiết */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Nút đóng */}
          <button
            onClick={() => setSelectedExhibit(null)}
            className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-slate-900/85 hover:bg-slate-800/90 text-slate-200 hover:text-white p-3 rounded-full border border-slate-700/60 backdrop-blur-sm transition-colors cursor-pointer z-50 shadow-md"
          >
            <X size={20} />
          </button>

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 custom-scrollbar text-base">

            {/* ═══════════════════════════════════════════════════════════════
                TRƯỜNG HỢP 1: GAMEPLAY HÀNH TRÌNH TÌM ĐƯỜNG (PHÒNG 01)
                ═══════════════════════════════════════════════════════════════ */}
            {isSubsidyRoom && gameData ? (
              <div className="space-y-4">
                {/* Tiêu đề hiện vật */}
                <div className="pr-12">
                  {selectedExhibit.id === 'exhibit-coupon' ? (
                    <h2 className="text-lg lg:text-xl xl:text-2xl font-black tracking-tight text-white leading-tight font-sans whitespace-nowrap">
                      NGƯỜI RA ĐI – Bến cảng Nhà Rồng – 5/6/1911
                    </h2>
                  ) : (
                    <>
                      <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-2 font-sans">
                        {titleText}
                      </h2>
                      <div className="text-amber-300 font-sans text-sm uppercase tracking-wider font-bold">
                        {authorText}
                      </div>
                    </>
                  )}
                </div>
                <hr className="border-slate-800/80" />

                {/* BƯỚC 1: QUAN SÁT HIỆN VẬT CÓ ĐẾM NGƯỢC */}
                {effectiveGameState === 'observe' && (
                  <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/20 animate-pulse relative">
                      <Clock size={24} />
                      <div className="absolute inset-0 rounded-full border border-amber-500/35 animate-ping opacity-25" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-widest">
                        Thời gian quan sát hiện vật
                      </span>
                      <h3 className="text-3xl font-mono font-black text-white">{countdown} giây</h3>
                      <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed font-sans pt-1">
                        Hãy rê chuột xung quanh hoặc ngắm kỹ bức tranh/hiện vật trong phòng 3D. Hết thời gian quan sát sẽ mở khóa câu hỏi trắc nghiệm lịch sử.
                      </p>
                    </div>
                  </div>
                )}

                {/* BƯỚC 2: TRẢ LỜI CÂU HỎI TRẮC NGHIỆM */}
                {effectiveGameState === 'quiz' && currentQuiz && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                      <HelpCircle size={14} />
                      <span>CÂU HỎI LỊCH SỬ {currentQuizIndex + 1}/{gameData.quizzes.length}</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                      <p className="font-sans text-xl lg:text-2xl font-bold text-slate-50 leading-relaxed">
                        {currentQuiz.question}
                      </p>
                    </div>

                    {!answerChecked && (
                      <div className="space-y-2">
                        {shuffledOptions.map((opt) => {
                          const isOptionSelected = currentQuiz.isMulti
                            ? selectedOptions.includes(opt.originalIndex)
                            : selectedOption === opt.originalIndex;

                          let optStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';

                          if (isOptionSelected) {
                            optStyle = 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold';
                          }

                          return (
                            <button
                              key={opt.originalIndex}
                              disabled={answerChecked}
                              onClick={() => handleSelectOption(opt.originalIndex)}
                              className={`w-full text-left p-5 rounded-2xl border text-base lg:text-lg leading-relaxed font-sans transition-all cursor-pointer ${optStyle}`}
                            >
                              <span className="font-mono font-bold mr-1.5">
                                {String.fromCharCode(65 + shuffledOptions.findIndex(item => item.originalIndex === opt.originalIndex))}.
                              </span>
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {!answerChecked ? (
                      <button
                        onClick={handleCheckAnswer}
                        disabled={(currentQuiz.isMulti ? selectedOptions.length === 0 : selectedOption === null)}
                        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black py-4 px-5 rounded-2xl transition-all cursor-pointer uppercase font-sans tracking-wide text-base"
                      >
                        Kiểm tra đáp án
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {isCorrect ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/25 p-5 rounded-2xl flex flex-col items-center text-center gap-3 text-emerald-400">
                            <Check size={30} />
                            <span className="font-mono font-bold text-sm">Đáp án chính xác!</span>
                            <p className="text-xs text-emerald-300/80">Bạn có thể chuyển sang tư liệu để thu thập vật phẩm.</p>
                          </div>
                        ) : (
                          <div className="bg-rose-500/10 border border-rose-500/25 p-5 rounded-2xl flex flex-col items-center text-center gap-3 text-rose-400">
                            <AlertTriangle size={30} />
                            <span className="font-mono font-bold text-sm">Lựa chọn chưa đúng.</span>
                            <p className="text-xs text-rose-300/80">Bạn có thể đóng hiện vật, xem lại tư liệu và bấm vào ảnh để thử lại câu hỏi.</p>
                          </div>
                        )}

                        <button
                          onClick={handleNextStep}
                          className={`w-full text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-mono tracking-wider ${
                            isCorrect ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              Tiếp tục thu thập
                              <ArrowRight size={14} />
                            </>
                          ) : (
                            'Tiếp tục xem tư liệu'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* BƯỚC 3: ĐỌC TƯ LIỆU VÀ LƯU MANH MỐI */}
                {effectiveGameState === 'info' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                        <BookOpen size={14} />
                        {selectedExhibit.id === 'exhibit-coupon' || selectedExhibit.id === 'exhibit-world-1911-1917' || selectedExhibit.id === 'exhibit-versailles-1919' || selectedExhibit.id === 'exhibit-lenin-theses-1920' || selectedExhibit.id === 'exhibit-tours-1920' || selectedExhibit.id === 'exhibit-guangzhou-1925-1927' || selectedExhibit.id === 'exhibit-convergence-1930'
                          ? 'Tư liệu hành trình cứu nước'
                          : 'Tư liệu hành trình lịch sử'}
                      </span>
                      <div className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/35 p-4 rounded-xl border border-slate-900 font-medium">
                        {selectedExhibit.id === 'exhibit-coupon' ? (
                          <div className="space-y-3">
                            <p>
                              Ngày 5/6/1911, từ Bến Nhà Rồng, người thanh niên Nguyễn Tất Thành rời Tổ quốc trên tàu Amiral Latouche-Tréville.
                            </p>
                            <p>
                              Trong bối cảnh các phong trào cứu nước đương thời chưa tìm được con đường giải phóng dân tộc phù hợp, Nguyễn Tất Thành quyết định ra nước ngoài để tìm hiểu thế giới và tìm một con đường mới cho dân tộc Việt Nam.
                            </p>
                            <p className="text-amber-200">
                              <strong>Ý nghĩa:</strong> Đây là điểm khởi đầu của hành trình tìm đường cứu nước.
                            </p>
                          </div>
                        ) : selectedExhibit.id === 'exhibit-world-1911-1917' ? (
                          <div className="space-y-3">
                            <p>
                              Sau khi rời Bến Nhà Rồng năm 1911, Nguyễn Tất Thành bắt đầu hành trình quan sát và tìm hiểu thế giới.
                            </p>
                            <p>
                              Trên đường sang Pháp, Người đi qua nhiều cảng như Singapore, Colombo (Sri Lanka), Port Said (Ai Cập) rồi đến Marseille, Pháp. Tại đây, Người bắt đầu trực tiếp quan sát xã hội Pháp và nhận ra rằng ngay tại chính quốc cũng tồn tại người nghèo và người lao động bị áp bức.
                            </p>
                            <p>
                              Năm 1912, Người tiếp tục theo tàu đi qua Tây Ban Nha, Bồ Đào Nha và nhiều vùng thuộc địa ở châu Phi như Algeria, Tunisia, Senegal, Congo, Dahomey, Madagascar, Réunion, Mozambique và Ai Cập. Những gì chứng kiến giúp Người nhận ra rằng nhân dân thuộc địa ở nhiều nơi đều chịu áp bức và bóc lột.
                            </p>
                            <p>
                              Cuối năm 1912, Nguyễn Tất Thành đến Hoa Kỳ, sống và làm việc tại một số nơi như New York, Brooklyn và Boston, đồng thời tìm hiểu xã hội Mỹ và đời sống của người lao động, đặc biệt là người da đen.
                            </p>
                            <p>
                              Khoảng cuối năm 1913, Người sang Anh và sống, lao động tại đây đến khoảng năm 1917. Quá trình này giúp Người hiểu thêm về xã hội tư bản, phong trào công nhân và tình cảnh của các dân tộc nằm dưới ách thống trị của chủ nghĩa thực dân Anh.
                            </p>
                            <p>
                              Cuối năm 1917, Nguyễn Tất Thành trở lại Pháp, bước sang một giai đoạn mới: từ chủ yếu quan sát và trải nghiệm thực tế sang tham gia ngày càng tích cực vào các hoạt động chính trị.
                            </p>
                            <p className="text-amber-200">
                              <strong>Ý nghĩa:</strong> Sáu năm đi qua nhiều quốc gia và châu lục giúp Nguyễn Tất Thành nhận ra rằng sự áp bức không chỉ tồn tại ở Việt Nam. Người từng bước phân biệt nhân dân lao động với các lực lượng thực dân, đồng thời hình thành nhận thức về sự gần gũi giữa các dân tộc bị áp bức.
                            </p>
                          </div>
                        ) : selectedExhibit.id === 'exhibit-versailles-1919' ? (
                          <div className="space-y-4">
                            <p>
                              Sau Chiến tranh thế giới thứ nhất, các nước thắng trận tổ chức Hội nghị Hòa bình Versailles để bàn về trật tự thế giới mới. Ngày 18/6/1919, thay mặt nhóm những người Việt Nam yêu nước tại Pháp, Nguyễn Ái Quốc gửi “Yêu sách của nhân dân An Nam” tới hội nghị và các đoàn đại biểu tham dự.
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                                <h3 className="mb-1 font-bold text-sky-300">📍 Bối cảnh</h3>
                                <p>Hội nghị Versailles được tổ chức sau Chiến tranh thế giới thứ nhất để xác lập một trật tự thế giới mới.</p>
                              </div>
                              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                                <h3 className="mb-1 font-bold text-amber-300">📜 Hành động</h3>
                                <p>Nguyễn Ái Quốc gửi bản yêu sách gồm 8 điểm, đòi quyền bình đẳng trước pháp luật, tự do báo chí, ngôn luận, lập hội, hội họp, cư trú, đi lại và học tập.</p>
                              </div>
                              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                                <h3 className="mb-1 font-bold text-rose-300">❌ Kết quả</h3>
                                <p>Những yêu cầu chính đáng không được các cường quốc tại Hội nghị Versailles đáp ứng.</p>
                              </div>
                              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                                <h3 className="mb-1 font-bold text-emerald-300">💡 Nhận thức</h3>
                                <p>Không thể chỉ trông chờ các cường quốc trao quyền tự do; dân tộc Việt Nam cần tiếp tục tìm một con đường giải phóng hiệu quả hơn.</p>
                              </div>
                            </div>

                            <p>
                              Sự kiện đánh dấu bước phát triển quan trọng: Nguyễn Ái Quốc không còn chỉ quan sát xã hội và đời sống người lao động mà đã trực tiếp đưa vấn đề quyền lợi của dân tộc Việt Nam ra một diễn đàn quốc tế.
                            </p>
                            <p className="text-amber-200">
                              <strong>Ý nghĩa:</strong> Từ thực tiễn đấu tranh, Nguyễn Ái Quốc ngày càng nhận thấy muốn giải phóng dân tộc cần tìm một con đường hiệu quả hơn, thay vì phụ thuộc vào sự ban phát quyền lợi từ các nước đế quốc. Câu hỏi đó dẫn Người tới bước ngoặt tiếp theo vào năm 1920.
                            </p>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-bold tracking-wide text-amber-300">
                              VERSAILLES 1919 · NGUYỄN ÁI QUỐC · 8 ĐIỂM YÊU SÁCH · TỰ DO · DÂN CHỦ · BÌNH ĐẲNG
                            </div>
                          </div>
                        ) : selectedExhibit.id === 'exhibit-lenin-theses-1920' ? (
                          <div className="space-y-4">
                            <p>
                              Sau nhiều năm đi qua nhiều quốc gia, trực tiếp quan sát xã hội và tham gia các hoạt động chính trị tại Pháp, Nguyễn Ái Quốc vẫn luôn tìm kiếm câu trả lời cho một vấn đề lớn: <strong className="text-white">Làm thế nào để giải phóng dân tộc Việt Nam khỏi ách thống trị của thực dân?</strong>
                            </p>
                            <p>
                              Tháng 7/1920, tại Paris, Nguyễn Ái Quốc đọc trên báo <em>L&apos;Humanité</em> <strong className="text-white">“Sơ thảo lần thứ nhất những luận cương về vấn đề dân tộc và vấn đề thuộc địa”</strong> của V.I. Lênin.
                            </p>
                            <p>
                              Luận cương đề cập trực tiếp đến <strong className="text-white">vấn đề dân tộc và thuộc địa</strong>, khẳng định phong trào cách mạng phải ủng hộ cuộc đấu tranh giải phóng của các dân tộc bị áp bức và chỉ ra mối quan hệ giữa cách mạng vô sản với phong trào giải phóng dân tộc.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                                <h3 className="mb-1 font-bold text-sky-300">🌍 Nhận ra mối liên hệ</h3>
                                <p>Cuộc đấu tranh của Việt Nam gắn với cuộc đấu tranh của các dân tộc thuộc địa và phong trào cách mạng thế giới.</p>
                              </div>
                              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                                <h3 className="mb-1 font-bold text-amber-300">💡 Xác định con đường</h3>
                                <p>Muốn giải phóng dân tộc phải đi theo con đường cách mạng vô sản, dựa vào lực lượng cách mạng của quần chúng nhân dân.</p>
                              </div>
                            </div>
                            <p>
                              Nếu năm <strong className="text-white">1911</strong> đánh dấu thời điểm Nguyễn Tất Thành “ra đi tìm đường”, thì việc tiếp cận Luận cương của Lênin năm <strong className="text-white">1920</strong> là <strong className="text-white">bước ngoặt quyết định về tư tưởng</strong>, giúp Nguyễn Ái Quốc xác định phương hướng cơ bản cho con đường giải phóng dân tộc Việt Nam.
                            </p>
                            <p className="text-amber-200">
                              <strong>Ý nghĩa:</strong> Sau gần một thập kỷ tìm tòi và khảo nghiệm thực tiễn, Nguyễn Ái Quốc chuyển từ “tìm kiếm con đường cứu nước” sang “xác định con đường cách mạng vô sản”. Đây là tiền đề trực tiếp cho sự lựa chọn chính trị của Người tại Đại hội Tours cuối năm 1920.
                            </p>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-bold tracking-wide text-amber-300">
                              LUẬN CƯƠNG LÊNIN · DÂN TỘC &amp; THUỘC ĐỊA · 1920 · CÁCH MẠNG VÔ SẢN
                            </div>
                          </div>
                        ) : selectedExhibit.id === 'exhibit-tours-1920' ? (
                          <div className="space-y-4">
                            <p>
                              Sau khi đọc <strong className="text-white">Luận cương của V.I. Lênin về vấn đề dân tộc và thuộc địa</strong> vào tháng 7/1920, Nguyễn Ái Quốc từng bước tìm thấy lời giải cho vấn đề Người theo đuổi từ khi rời Việt Nam năm 1911: <strong className="text-white">con đường giải phóng dân tộc</strong>.
                            </p>
                            <p>
                              Từ ngày <strong className="text-white">25 đến 30/12/1920</strong>, Nguyễn Ái Quốc tham dự <strong className="text-white">Đại hội lần thứ XVIII của Đảng Xã hội Pháp tại thành phố Tours</strong>. Một trong những vấn đề quan trọng của Đại hội là quyết định có gia nhập Quốc tế Cộng sản (Quốc tế III) hay không.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                                <h3 className="mb-1 font-bold text-amber-300">🗳️ Quyết định</h3>
                                <p>Nguyễn Ái Quốc đứng về phía những người ủng hộ Quốc tế Cộng sản và bỏ phiếu tán thành việc gia nhập Quốc tế III.</p>
                              </div>
                              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                                <h3 className="mb-1 font-bold text-sky-300">🚩 Dấu mốc chính trị</h3>
                                <p>Người trở thành một trong những thành viên tham gia sáng lập Đảng Cộng sản Pháp.</p>
                              </div>
                            </div>
                            <p>
                              Sau nhiều năm khảo nghiệm và tiếp cận tư tưởng của Lênin, Người xác định <strong className="text-white">cách mạng vô sản là con đường giải phóng dân tộc phù hợp với cách mạng Việt Nam</strong>.
                            </p>
                            <p>
                              Đây là bước chuyển quan trọng: từ <strong className="text-white">một người yêu nước đang tìm kiếm con đường cứu nước</strong>, Nguyễn Ái Quốc trở thành <strong className="text-white">một người cộng sản</strong>, gắn cuộc đấu tranh giải phóng dân tộc Việt Nam với phong trào cách mạng vô sản thế giới.
                            </p>
                            <p className="text-amber-200">
                              <strong>Ý nghĩa:</strong> Nếu việc đọc Luận cương của Lênin giúp Nguyễn Ái Quốc “tìm thấy con đường”, thì quyết định tại Đại hội Tours đánh dấu việc Người “chính thức lựa chọn và đứng về con đường đó”.
                            </p>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-bold tracking-wide text-amber-300">
                              ĐẠI HỘI TOURS · QUỐC TẾ III · ĐẢNG CỘNG SẢN PHÁP · CÁCH MẠNG VÔ SẢN · LỰA CHỌN
                            </div>
                          </div>
                        ) : selectedExhibit.id === 'exhibit-guangzhou-1925-1927' ? (
                          <div className="space-y-4">
                            <p>
                              Sau khi xác định con đường cách mạng vô sản, Nguyễn Ái Quốc nhận thấy rằng <strong className="text-white">chỉ có tư tưởng đúng là chưa đủ</strong>. Muốn tiến hành cách mạng ở Việt Nam cần truyền bá lý luận, đào tạo cán bộ, tổ chức phong trào và từng bước xây dựng lực lượng.
                            </p>
                            <p>
                              Cuối năm <strong className="text-white">1924</strong>, Nguyễn Ái Quốc đến <strong className="text-white">Quảng Châu, Trung Quốc</strong>, nơi có nhiều thanh niên Việt Nam yêu nước đang hoạt động. Từ đây, Người bắt đầu chuẩn bị trực tiếp về tư tưởng, chính trị và tổ chức cho cách mạng Việt Nam.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                                <h3 className="mb-1 font-bold text-sky-300">🏛️ Xây dựng tổ chức</h3>
                                <p>Tháng 6/1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên để tập hợp thanh niên yêu nước và truyền bá chủ nghĩa Mác – Lênin vào Việt Nam.</p>
                              </div>
                              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                                <h3 className="mb-1 font-bold text-emerald-300">🎓 Huấn luyện cán bộ</h3>
                                <p>Người trực tiếp mở các lớp về lý luận, phương pháp tổ chức và vận động quần chúng; nhiều học viên sau đó trở về Việt Nam xây dựng phong trào.</p>
                              </div>
                              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 sm:col-span-2">
                                <h3 className="mb-1 font-bold text-amber-300">📖 Truyền bá lý luận</h3>
                                <p>Các bài giảng được tập hợp và xuất bản thành <em>Đường Kách Mệnh</em> năm 1927, trình bày những vấn đề cơ bản về mục tiêu, lực lượng, tổ chức và phương pháp cách mạng.</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-xl border border-slate-700/60 bg-slate-900/60 p-3">
                              <strong className="text-amber-300">1920</strong>
                              <span>Nguyễn Ái Quốc xác định <strong className="text-white">con đường</strong>.</span>
                              <strong className="text-amber-300">1925–1927</strong>
                              <span>Người chuẩn bị <strong className="text-white">con người, lý luận và tổ chức</strong> để thực hiện con đường ấy.</span>
                            </div>
                            <p className="text-amber-200">
                              <strong>Ý nghĩa:</strong> Hoạt động tại Quảng Châu góp phần chuẩn bị về tư tưởng, chính trị, cán bộ và tổ chức, tạo những tiền đề quan trọng cho sự phát triển của phong trào cách mạng và sự ra đời của một chính đảng cộng sản ở Việt Nam sau này.
                            </p>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-bold tracking-wide text-amber-300">
                              QUẢNG CHÂU · HỘI VIỆT NAM CÁCH MẠNG THANH NIÊN · HUẤN LUYỆN CÁN BỘ · ĐƯỜNG KÁCH MỆNH · CHUẨN BỊ TỔ CHỨC
                            </div>
                          </div>
                        ) : selectedExhibit.id === 'exhibit-convergence-1930' ? (
                          <div className="space-y-4">
                            <p>
                              Đến cuối những năm 1920, phong trào công nhân và phong trào yêu nước Việt Nam phát triển mạnh. Yêu cầu thành lập một chính đảng cộng sản để lãnh đạo cách mạng ngày càng trở nên cấp thiết.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                                <h3 className="mb-1 font-bold text-rose-300">Bắc Kỳ</h3>
                                <p><strong className="text-white">Đông Dương Cộng sản Đảng</strong> được thành lập.</p>
                              </div>
                              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                                <h3 className="mb-1 font-bold text-amber-300">Nam Kỳ</h3>
                                <p><strong className="text-white">An Nam Cộng sản Đảng</strong> được thành lập và hoạt động chủ yếu tại đây.</p>
                              </div>
                              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                                <h3 className="mb-1 font-bold text-sky-300">Trung Kỳ</h3>
                                <p><strong className="text-white">Đông Dương Cộng sản Liên đoàn</strong> ra đời từ sự chuyển biến của lực lượng cách mạng.</p>
                              </div>
                            </div>
                            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3">
                              <h3 className="mb-1 font-bold text-rose-300">⚠️ Vấn đề đặt ra</h3>
                              <p>Các tổ chức cùng hoạt động theo khuynh hướng cộng sản nhưng tồn tại riêng rẽ, tranh giành ảnh hưởng và thiếu sự lãnh đạo thống nhất, khiến phong trào có nguy cơ phân tán về lực lượng và tổ chức.</p>
                            </div>
                            <p>
                              Với tư cách đại diện của <strong className="text-white">Quốc tế Cộng sản</strong>, Nguyễn Ái Quốc từ Xiêm đến <strong className="text-white">Hồng Kông</strong> để triệu tập và chủ trì một hội nghị nhằm giải quyết sự chia rẽ giữa các tổ chức cộng sản.
                            </p>
                            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-4">
                              <h3 className="mb-2 font-bold text-amber-300">❓ Câu hỏi quyết định</h3>
                              <p className="text-white">Có thể thống nhất những tổ chức đang hoạt động riêng rẽ thành một chính đảng duy nhất hay không?</p>
                              <p className="mt-2 text-white">Và nếu thống nhất, họ sẽ thống nhất trên cơ sở nào?</p>
                            </div>
                            <p className="text-amber-200">
                              <strong>Kết quả:</strong> Sau đó, Đảng Cộng sản Việt Nam được thành lập, mở ra một bước ngoặt quan trọng của cách mạng Việt Nam.
                            </p>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-bold tracking-wide text-amber-300">
                              1929 · BA TỔ CHỨC CỘNG SẢN · PHÂN TÁN · THỐNG NHẤT · HỒNG KÔNG 1930
                            </div>
                          </div>
                        ) : (
                          <p className="text-justify">{gameData.historyText}</p>
                        )}
                      </div>
                    </div>



                    {/* Nút lưu manh mối: chỉ hiện trong luồng chơi/câu hỏi, không hiện khi bấm bệ xem thông tin */}
                    {exhibitModalMode === 'game' && canCollectCurrentClue && (
                      !cluesCollected.includes(selectedExhibit.id) ? (
                        <button
                          onClick={handleCollectClue}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-sans tracking-widest text-[11px]"
                        >
                          <Save size={16} />
                          Thu thập manh mối
                        </button>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400">
                          <span className="text-xl">📒</span>
                          <div>
                            <span className="text-[10px] font-bold block tracking-wider uppercase font-sans text-emerald-500">Đã lưu vào Sổ điều tra</span>
                            <span className="text-xs font-semibold leading-relaxed font-sans">{gameData.clueText}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ═══════════════════════════════════════════════════════════════
                  TRƯỜNG HỢP 2: THUYẾT MINH MẶC ĐỊNH (PHÒNG TRANH HOẶC TƯỢNG)
                  ═══════════════════════════════════════════════════════════════ */
              <>
                {/* Tiêu đề & Tác giả */}
                <div className="pr-12">
                  <h2 className="text-xl font-bold tracking-tight text-white leading-tight mb-1 font-sans">
                    {titleText}
                  </h2>
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
                    <User size={12} />
                    <span className="font-semibold">{authorText}</span>
                  </div>
                </div>

                <hr className="border-slate-800/80" />

                {/* Bộ đổi ngôn ngữ (i18n) */}
                <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <Globe size={14} />
                    {language === 'vi' ? 'NGÔN NGỮ THUYẾT MINH' : 'GUIDE LANGUAGE'}
                  </span>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setLanguage('vi')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer font-mono ${language === 'vi' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      VI
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer font-mono ${language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                {/* Thuyết minh văn bản */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                    <BookOpen size={14} />
                    {selectedExhibit.id === 'vn-back-right'
                      ? (language === 'vi' ? 'LUẬT CHƠI' : 'RULES OF THE GAME')
                      : (language === 'vi' ? 'THUYẾT MINH HIỆN VẬT' : 'EXPLANATORY NOTE')}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify bg-slate-900/20 p-3 rounded-xl border border-slate-900 whitespace-pre-line">
                    {descriptionText}
                  </p>
                </div>

                {/* Audio Guide */}
                {selectedExhibit.id !== 'vn-back-right' && (
                  <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                        <Volume2 size={14} />
                        AUDIO GUIDE
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTime(audioProgress)} / {formatTime(audioDuration)}
                      </span>
                    </div>

                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setAudioPlaying(!audioPlaying)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-5 rounded-full font-bold text-[10px] transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20 font-mono"
                      >
                        {audioPlaying ? (
                          <>
                            <Pause size={12} fill="currentColor" />
                            TẠM DỪNG
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" />
                            NGHE THUYẾT MINH
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Nút chơi game cho hiện vật WTO */}
                {selectedExhibit.id === 'vn-back-right' && (
                  <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-4 rounded-xl border border-cyan-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                        <Gamepad2 size={14} />
                        {language === 'vi' ? 'DÒNG CHẢY LỊCH SỬ' : 'HISTORY FLOW'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      {language === 'vi'
                        ? 'Kiểm tra trí nhớ của bạn qua trò chơi sắp xếp trục thời gian về các dấu mốc lịch sử.'
                        : 'Test your memory with our timeline sorting game about historical milestones.'}
                    </p>
                    <p className="text-[10px] text-amber-400 font-semibold bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed font-sans">
                      {language === 'vi'
                        ? '⚠️ Lưu ý: Mỗi người chơi chỉ được chơi 1 lần duy nhất. Khi đã bắt đầu chơi game, bạn có thể thoát ra ngoài để kiểm tra lại các tác phẩm tranh trong phòng nhằm chắc chắn mốc thời gian của từng sự kiện trước khi xác nhận sắp xếp!'
                        : '⚠️ Note: Each player can only play once. When you start the game, you can exit to check the paintings in the room to make sure of the time of each event before confirming the sorting!'}
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          if (globalGameState === 'idle') {
                            initializeGame();
                          }
                          setMiniGameOpen(true);
                          setSelectedExhibit(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2.5 px-6 rounded-xl font-bold text-xs transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20 font-mono"
                      >
                        <Gamepad2 size={14} fill="currentColor" />
                        {globalGameState === 'playing'
                          ? (language === 'vi' ? 'TIẾP TỤC CHƠI' : 'RESUME GAME')
                          : (globalGameState === 'won' || globalGameState === 'lost'
                            ? (language === 'vi' ? 'XEM KẾT QUẢ' : 'VIEW RESULTS')
                            : (language === 'vi' ? 'BẮT ĐẦU CHƠI GAME' : 'START GAME'))}
                      </button>
                    </div>
                  </div>
                )}

                {/* Nút thu thập tranh cho phòng gốm sứ */}
                {activeGallery?.id === 'gallery-ceramics' && selectedExhibit.id !== 'vn-back-right' && (
                  !collectedCeramics.includes(selectedExhibit.id) ? (
                    <button
                      disabled={ceramicsCountdown > 0}
                      onClick={() => {
                        addCeramic(selectedExhibit.id);
                      }}
                      className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase font-sans tracking-widest text-xs mt-4 ${
                        ceramicsCountdown > 0
                          ? 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                      }`}
                    >
                      <Save size={16} />
                      {language === 'vi' 
                        ? (ceramicsCountdown > 0 ? `Thu thập dữ kiện (${ceramicsCountdown}s)` : 'Thu thập dữ kiện') 
                        : (ceramicsCountdown > 0 ? `Collect Evidence (${ceramicsCountdown}s)` : 'Collect Evidence')}
                    </button>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 mt-4">
                      <span className="text-xl">🖼️</span>
                      <div>
                        <span className="text-[10px] font-bold block tracking-wider uppercase font-sans text-emerald-500">
                          {language === 'vi' ? 'Đã thu thập dữ kiện' : 'Evidence Collected'}
                        </span>
                        <span className="text-xs font-semibold leading-relaxed font-sans">
                          {language === 'vi' 
                            ? `Đã lưu: ${CERAMIC_EVENTS_MAP[selectedExhibit.id]?.vi || 'Dữ kiện'}` 
                            : `Saved: ${CERAMIC_EVENTS_MAP[selectedExhibit.id]?.en || 'Evidence'}`}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitModal;
