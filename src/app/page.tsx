"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-[#fbf9f8] text-[#1b1c1c] min-h-screen flex flex-col relative overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="bg-[#fbf9f8]/80 backdrop-blur-md text-[#5f5e5e] border-b border-[#c4c7c6]/30 fixed top-0 w-full z-50 flex justify-between items-center px-16 py-4 hidden md:flex">
        <div className="font-headline-md text-[32px] font-bold text-[#5f5e5e] whitespace-nowrap overflow-hidden text-ellipsis max-w-sm">
          Bảo tàng Tiến hóa Kinh tế
        </div>

        {/* <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-[#725b29] border-b-2 border-[#725b29] pb-1 font-label-sm text-[12px] hover:bg-[#e3e2e2]/50 transition-all duration-300 px-2 py-1 uppercase tracking-wider font-semibold"
          >
            Sảnh chính
          </Link>
          <Link
            href="/gallery/gallery-paintings"
            className="text-[#444747] hover:text-[#5f5e5e] transition-colors font-label-sm text-[12px] hover:bg-[#e3e2e2]/50 transition-all duration-300 px-2 py-1 uppercase tracking-wider font-semibold"
          >
            Khởi nguồn
          </Link>
          <Link
            href="/gallery/gallery-ceramics"
            className="text-[#444747] hover:text-[#5f5e5e] transition-colors font-label-sm text-[12px] hover:bg-[#e3e2e2]/50 transition-all duration-300 px-2 py-1 uppercase tracking-wider font-semibold"
          >
            Gốm sứ
          </Link>
          <Link
            href="/gallery/gallery-market-economy"
            className="text-[#444747] hover:text-[#5f5e5e] transition-colors font-label-sm text-[12px] hover:bg-[#e3e2e2]/50 transition-all duration-300 px-2 py-1 uppercase tracking-wider font-semibold"
          >
            Thị trường
          </Link>
          <Link
            href="/gallery/gallery-paintings"
            className="text-[#444747] hover:text-[#5f5e5e] transition-colors font-label-sm text-[12px] hover:bg-[#e3e2e2]/50 transition-all duration-300 px-2 py-1 uppercase tracking-wider font-semibold"
          >
            Việt Nam
          </Link>
        </div> */}

        <div className="flex items-center gap-4">
          <button className="text-[#444747] hover:text-[#5f5e5e] transition-colors p-2 rounded-full hover:bg-[#e3e2e2]/50 flex items-center justify-center">
            <span className="material-symbols-outlined font-normal">
              search
            </span>
          </button>
          {/* <Link
            href="/gallery/gallery-paintings"
            className="bg-[#5f5e5e]/10 text-[#5f5e5e] border border-[#5f5e5e]/30 px-6 py-2 rounded scale-95 active:opacity-80 transition-all font-label-sm text-[12px] font-semibold hover:bg-[#5f5e5e] hover:text-white uppercase tracking-widest text-center"
          >
            Tham quan
          </Link> */}
        </div>
      </nav>

      {/* SideNavBar (Mobile Bottom Navigation) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#f5f3f3]/95 backdrop-blur-xl border-t border-[#c4c7c6]/20 z-50 flex justify-around py-3 px-5">
        <Link
          className="flex flex-col items-center gap-1 text-[#725b29]"
          href="/"
        >
          <div className="bg-[#fcf9f8] text-[#737272] rounded-full p-1 px-4">
            <span className="material-symbols-outlined text-xl font-semibold">
              account_balance
            </span>
          </div>
          <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider">
            Sảnh chính
          </span>
        </Link>
        <Link
          className="flex flex-col items-center gap-1 text-[#444747] hover:text-[#725b29] transition-all"
          href="/gallery/gallery-paintings"
        >
          <div className="p-1 px-4 hover:bg-[#e3e2e2] rounded-full">
            <span className="material-symbols-outlined text-xl">
              history_edu
            </span>
          </div>
          <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider">
            Khởi nguồn
          </span>
        </Link>
        <Link
          className="flex flex-col items-center gap-1 text-[#444747] hover:text-[#725b29] transition-all"
          href="/gallery/gallery-market-economy"
        >
          <div className="p-1 px-4 hover:bg-[#e3e2e2] rounded-full">
            <span className="material-symbols-outlined text-xl">
              account_tree
            </span>
          </div>
          <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider">
            Thị trường
          </span>
        </Link>
        <Link
          className="flex flex-col items-center gap-1 text-[#444747] hover:text-[#725b29] transition-all"
          href="/gallery/gallery-paintings"
        >
          <div className="p-1 px-4 hover:bg-[#e3e2e2] rounded-full">
            <span className="material-symbols-outlined text-xl">explore</span>
          </div>
          <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider">
            Việt Nam
          </span>
        </Link>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 md:pt-32 pb-[120px] flex flex-col items-center w-full z-10">
        {/* Hero Section */}
        <section className="w-full max-w-[1440px] px-5 md:px-16 mb-[120px] relative">
          <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-xl overflow-hidden flex items-center justify-center">
            {/* Atmospheric Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center z-0"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA25Y0I_1xm3GK_b0qEfPJytu2jKXdqF8FKJ1edhkR96uKHmo_NzpkZaSe4zVI3bFiEhUQex4uz7cGxJjphMiwvUTxWlVYTrSpGEhCxiNdoMZ31L_lNOAr7ZiERiGGb328ESRbpxERoKJW-Z7hwYEWwG0Bjq8C3aEEWnxoNUWdJpMNaPDjsBfej0S2w_KtsBN5myBRT-DI8jD_GqU9p-Sa9m2zaRf9UE6-n6QeG4GOcLO4X_k8nnqnNaroAZY3e4TwccQqe8p78yl4")',
              }}
            />
            {/* Gradient Overlay for readability and depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10"></div>

            <div className="relative z-20 text-center md:text-left md:absolute md:left-20 md:bottom-20 max-w-3xl px-6 md:px-0">
              <h1 className="font-display-lg text-[40px] sm:text-[64px] font-medium mb-6 drop-shadow-lg text-white leading-tight">
                Bảo tàng Tiến hóa Kinh tế &amp; Tọa độ Việt Nam
              </h1>
              <p className="font-body-lg text-[16px] sm:text-[18px] mb-10 max-w-2xl drop-shadow-md text-white/95 leading-relaxed">
                Hành trình khám phá sự phát triển của nền kinh tế nhân loại từ
                sơ khai đến hội nhập toàn cầu.
              </p>
              <Link
                href="/lobby"
                className="group inline-flex items-center gap-3 bg-[#725b29] px-8 py-4 rounded-full border border-[#725b29] hover:bg-[#725b29]/90 transition-all duration-300 drop-shadow-lg text-white cursor-pointer"
              >
                <span className="font-label-sm text-[12px] uppercase tracking-widest font-semibold">
                  Bắt đầu chuyến tham quan
                </span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Museum Map Section (Bản đồ tham quan) */}
        <section className="w-full max-w-[1440px] px-5 md:px-16">
          <div className="mb-16 flex items-center gap-6">
            <h2 className="font-headline-lg text-[40px] text-[#1b1c1c] font-medium">
              Bản đồ tham quan
            </h2>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-[#725b29]/50 to-transparent"></div>
          </div>

          {/* Bento Grid Layout for Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px]">
            {/* Room 1 */}
            <div className="md:col-span-7 glass-panel artifact-card rounded-xl overflow-hidden relative group flex flex-col justify-end p-8">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:opacity-70 transition-opacity duration-500 z-0"
                style={{
                  backgroundImage:
                    'url("/images/room4/anhphong1.jpg")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10"></div>
              <div className="relative z-20 flex flex-col gap-4">
                <span className="font-label-sm text-[12px] inline-block uppercase tracking-widest font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full w-fit text-white">
                  Phòng 01
                </span>
                <h3 className="font-headline-md text-[32px] font-bold text-white drop-shadow-md">
                  Phòng Bao Cấp
                </h3>
                <p className="font-body-md text-[16px] text-white/90 max-w-md line-clamp-2 drop-shadow-sm leading-relaxed">
                  Trải nghiệm trò chơi điều tra lịch sử bao cấp, tích lũy manh
                  mối và giải đáp câu đố thời kỳ trước Đổi mới.
                </p>
              </div>
            </div>

            {/* Room 2 */}
            <div className="md:col-span-5 glass-panel artifact-card rounded-xl overflow-hidden relative group flex flex-col justify-end p-8">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:opacity-70 transition-opacity duration-500 z-0"
                style={{
                  backgroundImage:
                    'url("/images/room4/anhphong2.jpg")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10"></div>
              <div className="relative z-20 flex flex-col gap-4">
                <span className="font-label-sm text-[12px] inline-block uppercase tracking-widest font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full w-fit text-white">
                  Phòng 02
                </span>
                <h3 className="font-headline-md text-[32px] font-bold text-white drop-shadow-md">
                  Phòng Đổi Mới
                </h3>
                <p className="font-body-md text-[16px] text-white/90 max-w-sm line-clamp-2 drop-shadow-sm leading-relaxed">
                  Nghiên cứu bối cảnh lịch sử Đại hội VI (12/1986), hóa thân thành đại biểu để thảo luận và đưa ra quyết sách Đổi mới đất nước.
                </p>
              </div>
            </div>

            {/* Room 3 */}
            <div className="md:col-span-4 glass-panel artifact-card rounded-xl overflow-hidden relative group flex flex-col justify-end p-8">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:opacity-70 transition-opacity duration-500 z-0"
                style={{
                  backgroundImage:
                    'url("/images/room4/anhphong3.jpg")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10"></div>
              <div className="relative z-20 flex flex-col gap-4">
                <span className="font-label-sm text-[12px] inline-block uppercase tracking-widest font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full w-fit text-white">
                  Phòng 03
                </span>
                <h3 className="font-headline-md text-[28px] font-bold text-white drop-shadow-md">
                  Phòng Hội Nhập
                </h3>
                <p className="font-body-md text-[16px] text-white/90 max-w-sm line-clamp-2 drop-shadow-sm leading-relaxed">
                  Tìm hiểu chặng đường hội nhập kinh tế quốc tế của Việt Nam qua các tác phẩm tranh tư liệu và mini game dòng chảy lịch sử.
                </p>
              </div>
            </div>

            {/* Room 4 */}
            <div className="md:col-span-4 glass-panel artifact-card rounded-xl overflow-hidden relative group flex flex-col justify-end p-8">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:opacity-70 transition-opacity duration-500 z-0"
                style={{
                  backgroundImage:
                    'url("/images/room4/anhphong4.jpg")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10"></div>
              <div className="relative z-20 flex flex-col gap-4">
                <span className="font-label-sm text-[12px] inline-block uppercase tracking-widest font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full w-fit text-white">
                  Phòng 04
                </span>
                <h3 className="font-headline-md text-[28px] font-bold text-white drop-shadow-md">
                  Phòng Thị Trường
                </h3>
                <p className="font-body-md text-[16px] text-white/90 max-w-sm line-clamp-2 drop-shadow-sm leading-relaxed">
                  Khám phá các đặc trưng của nền Kinh tế Thị trường định hướng XHCN Việt Nam trong kỷ nguyên mới.
                </p>
              </div>
            </div>

            {/* Room 5 */}
            <div className="md:col-span-4 glass-panel artifact-card rounded-xl overflow-hidden relative group flex flex-col justify-end p-8">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:opacity-70 transition-opacity duration-500 z-0"
                style={{
                  backgroundImage:
                    'url("/exhibits/nha-rong-departure.svg")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10"></div>
              <div className="relative z-20 flex flex-col gap-4">
                <span className="font-label-sm text-[12px] inline-block uppercase tracking-widest font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full w-fit text-white">
                  Phòng 05
                </span>
                <h3 className="font-headline-md text-[28px] font-bold text-white drop-shadow-md">
                  Bến Nhà Rồng 1911
                </h3>
                <p className="font-body-md text-[16px] text-white/90 max-w-sm line-clamp-2 drop-shadow-sm leading-relaxed">
                  Khám phá Bến Nhà Rồng, chuyến tàu Amiral Latouche-Tréville và công việc phụ bếp của người thanh niên Nguyễn Tất Thành.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#ffffff] border-t border-[#c4c7c6]/20 w-full py-[120px] px-16 flex flex-col items-center gap-6 z-10 relative mb-16 md:mb-0">
        <div className="font-headline-md text-[32px] text-[#725b29] mb-4 text-center font-bold">
          Bảo tàng Tiến hóa Kinh tế &amp; Tọa độ Việt Nam
        </div>
        {/* <div className="flex flex-wrap justify-center gap-8 mb-8">
          <Link
            className="text-[#444747] hover:text-[#1b1c1c] underline decoration-[#725b29] underline-offset-4 opacity-80 hover:opacity-100 transition-opacity font-label-sm text-[12px] uppercase font-bold tracking-wider"
            href="#"
          >
            Điều khoản
          </Link>
          <Link
            className="text-[#444747] hover:text-[#1b1c1c] underline decoration-[#725b29] underline-offset-4 opacity-80 hover:opacity-100 transition-opacity font-label-sm text-[12px] uppercase font-bold tracking-wider"
            href="#"
          >
            Bảo mật
          </Link>
          <Link
            className="text-[#444747] hover:text-[#1b1c1c] underline decoration-[#725b29] underline-offset-4 opacity-80 hover:opacity-100 transition-opacity font-label-sm text-[12px] uppercase font-bold tracking-wider"
            href="#"
          >
            Lưu trữ
          </Link>
          <Link
            className="text-[#444747] hover:text-[#1b1c1c] underline decoration-[#725b29] underline-offset-4 opacity-80 hover:opacity-100 transition-opacity font-label-sm text-[12px] uppercase font-bold tracking-wider"
            href="#"
          >
            Tọa độ số
          </Link>
        </div> */}
        <p className="text-[#5f5e5e] font-body-md text-[16px] text-center max-w-2xl opacity-70 leading-relaxed">
          © 2026 Bảo tàng Tiến hóa Kinh tế &amp; Tọa độ Việt Nam. Một sản phẩm
          của Nhóm 7 - MLN122.
        </p>
      </footer>
    </div>
  );
}
