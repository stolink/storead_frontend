import { Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Instagram,
  Globe,
  Database,
  BookOpen,
  Users,
} from "lucide-react";

interface FooterLink {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FooterSection[] = [
    {
      title: "플랫폼",
      links: [
        { label: "홈", path: "/" },
        { label: "장르별 탐색", path: "/category/ALL" },
        { label: "실시간 랭킹", path: "/ranking" },
        { label: "무료 이용권", path: "/event" },
      ],
    },
    {
      title: "작가 서비스",
      links: [
        { label: "작품 등록", path: "/write" },
        { label: "작가 센터", path: "/author" },
        { label: "가이드북", path: "/guide" },
        { label: "제휴 문의", path: "/contact" },
      ],
    },
    {
      title: "고객 지원",
      links: [
        { label: "공지사항", path: "/notice" },
        { label: "자주 묻는 질문", path: "/faq" },
        { label: "1:1 문의", path: "/support" },
        { label: "이용 약관", path: "/terms" },
      ],
    },
    {
      title: "소셜 미디어",
      links: [
        {
          label: "Twitter",
          path: "https://twitter.com",
          icon: <Twitter className="w-4 h-4" />,
        },
        {
          label: "Instagram",
          path: "https://instagram.com",
          icon: <Instagram className="w-4 h-4" />,
        },
        {
          label: "GitHub",
          path: "https://github.com",
          icon: <Github className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Statistics Banner - Refined and Subtle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 mb-12 border-b border-zinc-50 dark:border-zinc-900 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mocha-50 dark:bg-mocha-900/20 flex items-center justify-center text-mocha-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                등록된 작품
              </p>
              <p className="text-xl font-bold text-espresso-900 dark:text-zinc-100">
                1,234
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                활성 작가
              </p>
              <p className="text-xl font-bold text-espresso-900 dark:text-zinc-100">
                856
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                누적 열람
              </p>
              <p className="text-xl font-bold text-espresso-900 dark:text-zinc-100">
                50,000+
              </p>
            </div>
          </div>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-espresso-900 dark:text-zinc-100 font-black text-sm mb-6 flex items-center gap-2">
                <span className="w-1 h-4 bg-mocha-500 rounded-full" />
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-zinc-500 hover:text-mocha-600 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-50 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-mocha-600 flex items-center justify-center text-white">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tighter text-espresso-900 dark:text-zinc-100">
                StoRead
              </span>
            </div>
            <p className="text-zinc-400 text-xs text-center md:text-left leading-relaxed">
              (주) 스토리스튜디오 | 대표자: 홍길동 | 사업자등록번호:
              123-45-67890
              <br />
              서울특별시 강남구 테헤란로 123, 456호 | 통신판매업신고:
              2024-서울강남-1234
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 text-right">
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="text-zinc-500 hover:text-mocha-600 text-xs font-bold"
              >
                개인정보처리방침
              </Link>
              <Link
                to="/terms"
                className="text-zinc-500 hover:text-mocha-600 text-xs font-bold"
              >
                이용약관
              </Link>
              <Link
                to="/youth"
                className="text-zinc-500 hover:text-mocha-600 text-xs font-bold"
              >
                청소년보호정책
              </Link>
            </div>
            <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-widest">
              &copy; {currentYear} StoRead. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
