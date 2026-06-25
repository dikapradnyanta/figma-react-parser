// Realistic placeholder content for the prototype.

export interface Course {
  id: string;
  name: string;
  lecturer: string;
  progress: number;
}

export const courses: Course[] = [
  {
    id: "mpti",
    name: "Manajemen Proyek Teknologi Informasi",
    lecturer: "Dr. Ida Bagus Dharma",
    progress: 65,
  },
  {
    id: "rpl",
    name: "Rekayasa Perangkat Lunak",
    lecturer: "I Made Suartana, M.T.",
    progress: 40,
  },
  {
    id: "bdl",
    name: "Basis Data Lanjut",
    lecturer: "Ni Luh Putu Saridewi",
    progress: 80,
  },
  {
    id: "ai",
    name: "Kecerdasan Buatan",
    lecturer: "Dr. Anak Agung Gede",
    progress: 20,
  },
];

export interface Material {
  id: string;
  type: "pdf" | "video";
  title: string;
  lecturer: string;
  meta: string;
}

export const materials: Material[] = [
  {
    id: "m1",
    type: "pdf",
    title: "Modul 1 - Pengantar MPTI",
    lecturer: "Dr. Ida Bagus Dharma",
    meta: "2.4 MB",
  },
  {
    id: "m2",
    type: "pdf",
    title: "Modul 2 - Perencanaan Proyek",
    lecturer: "Dr. Ida Bagus Dharma",
    meta: "3.1 MB",
  },
  {
    id: "m3",
    type: "video",
    title: "Video: Metode Agile & Scrum",
    lecturer: "Dr. Ida Bagus Dharma",
    meta: "45 min",
  },
  {
    id: "m4",
    type: "pdf",
    title: "Modul 3 - Manajemen Risiko",
    lecturer: "Dr. Ida Bagus Dharma",
    meta: "1.8 MB",
  },
  {
    id: "m5",
    type: "video",
    title: "Video: Studi Kasus Proyek Nyata",
    lecturer: "Dr. Ida Bagus Dharma",
    meta: "30 min",
  },
];

export interface Quiz {
  id: string;
  title: string;
  status: "Aktif" | "Selesai";
  meta: string;
}

export const quizzes: Quiz[] = [
  { id: "q1", title: "Kuis Bab 1 & 2", status: "Aktif", meta: "10 Soal · 30 Menit" },
  { id: "q2", title: "Kuis Tengah Semester", status: "Aktif", meta: "25 Soal · 60 Menit" },
  { id: "q3", title: "Kuis Bab 3", status: "Selesai", meta: "15 Soal · 20 Menit" },
];

export interface QuizOption {
  key: string;
  text: string;
}

export const examQuestion = {
  number: 3,
  total: 10,
  question:
    "Apa yang dimaksud dengan Work Breakdown Structure (WBS) dalam manajemen proyek?",
  options: [
    { key: "A", text: "Dokumen perencanaan anggaran" },
    { key: "B", text: "Dekomposisi hierarkis lingkup pekerjaan" },
    { key: "C", text: "Diagram alur komunikasi tim" },
    { key: "D", text: "Metode penjadwalan proyek" },
  ] as QuizOption[],
};

export interface Thread {
  id: string;
  initials: string;
  avatarColor: string;
  author: string;
  time: string;
  tag: string;
  title: string;
  preview: string;
  replies: number;
  likes: number;
}

export const threads: Thread[] = [
  {
    id: "t1",
    initials: "BS",
    avatarColor: "#4A90E2",
    author: "Budi Santoso",
    time: "2 jam lalu",
    tag: "MPTI",
    title: "Perbedaan Agile vs Waterfall dalam proyek skala besar?",
    preview:
      "Halo teman-teman, saya ingin diskusi mengenai pendekatan mana yang lebih cocok untuk proyek dengan tim besar dan kebutuhan yang sering berubah...",
    replies: 12,
    likes: 24,
  },
  {
    id: "t2",
    initials: "DP",
    avatarColor: "#0D3B66",
    author: "Dewi Puspita",
    time: "5 jam lalu",
    tag: "MPTI",
    title: "Bagaimana cara membuat WBS yang efektif?",
    preview:
      "Saya kesulitan dalam memecah task menjadi sub-task yang terukur. Apakah ada tips atau template yang biasa kalian gunakan?",
    replies: 8,
    likes: 15,
  },
  {
    id: "t3",
    initials: "AR",
    avatarColor: "#22C55E",
    author: "Adi Rahmat",
    time: "1 hari lalu",
    tag: "RPL",
    title: "Tools terbaik untuk manajemen risiko proyek IT?",
    preview:
      "Ada yang sudah pernah menggunakan tools seperti Jira atau Monday untuk tracking risiko? Mau dengar pengalaman kalian sebelum memutuskan...",
    replies: 21,
    likes: 31,
  },
  {
    id: "t4",
    initials: "SW",
    avatarColor: "#F59E0B",
    author: "Sari Wijaya",
    time: "2 hari lalu",
    tag: "Basis Data",
    title: "Optimasi query pada tabel berukuran besar?",
    preview:
      "Query saya berjalan sangat lambat pada tabel dengan jutaan baris. Apakah indexing saja cukup atau perlu partisi tabel juga?",
    replies: 17,
    likes: 28,
  },
];
