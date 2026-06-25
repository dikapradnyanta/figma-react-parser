Create a complete mobile app UI prototype for a University E-Learning application called "Primakara E-Learning" for Universitas Primakara. 

Design 4 separate mobile screens (375px x 812px each) for the Bottom Navigation Bar tabs.

=== GLOBAL DESIGN SYSTEM ===
- Style: Clean Minimalism + Corporate-Academic Aesthetic
- Font: Inter (all screens)
- Background: #F4F6F9
- Card Background: #FFFFFF
- Corner Radius (Cards): 16px
- Corner Radius (Buttons/Inputs): 12px
- Corner Radius (Badges/Tags): 30px
- Shadow: 0px 4px 12px rgba(0, 0, 0, 0.03)

Color Palette:
- Primary Deep Blue: #0D3B66
- Accent Soft Blue: #4A90E2
- Pure White: #FFFFFF
- Light Slate Grey: #F4F6F9
- Text Primary Dark: #1F2937
- Caption / Metadata: #6B7280
- Alert Red: #EF4444

Typography:
- H1 (Screen Title / Username): 20pt, SemiBold, #1F2937
- H2 (Section Header): 16pt, Medium, #1F2937
- Body Text: 14pt, Regular, #2D3748
- Caption / Metadata: 12pt, Light Italic, #6B7280
- Button Text: 14pt, Medium, #FFFFFF

Bottom Navigation Bar (present on all 4 screens):
- 4 icons: Home, Book, Quiz, Forum
- Active icon color: #0D3B66
- Inactive icon color: #6B7280
- Background: #FFFFFF
- Height: 64px with safe area

=== SCREEN 1: HOME / DASHBOARD ===
Top Header area (background: #0D3B66, white text):
- Left: Greeting text "Selamat Pagi," (12pt, caption, white)
- Left: Name "Hi, Budi Santoso! 👋" (20pt, SemiBold, white)
- Right: Bell notification icon with a red badge dot, white icon

Below header (on #F4F6F9 background):
- Capsule-shaped search bar, white background, placeholder text "Cari mata kuliah atau materi...", search icon left, 12px border radius

Section title: "Mata Kuliah Aktif" (16pt, Medium, #1F2937)

2-column card grid showing 4 course cards:
Card 1: "Manajemen Proyek Teknologi Informasi" — lecturer "Dr. Ida Bagus Dharma", progress bar 65% filled with #4A90E2
Card 2: "Rekayasa Perangkat Lunak" — lecturer "I Made Suartana, M.T.", progress bar 40% filled with #4A90E2
Card 3: "Basis Data Lanjut" — lecturer "Ni Luh Putu Saridewi", progress bar 80% filled with #4A90E2
Card 4: "Kecerdasan Buatan" — lecturer "Dr. Anak Agung Gede", progress bar 20% filled with #4A90E2
Each card: white background, 16px corner radius, soft shadow, small colored icon top, course name bold, lecturer name in caption style, progress percentage text

=== SCREEN 2: MATERI KULIAH (MATERIALS) ===
Top header: #0D3B66, white text "Materi Kuliah", back arrow icon
Subtitle: "Manajemen Proyek Teknologi Informasi"

Clean linear list of 5 material cards, each on white background with soft shadow, 16px corner radius:

Item 1: PDF icon (blue) left | "Modul 1 - Pengantar MPTI" (bold) / "Dr. Ida Bagus Dharma · 2.4 MB" (caption) | download circle icon right
Item 2: PDF icon (blue) left | "Modul 2 - Perencanaan Proyek" / "Dr. Ida Bagus Dharma · 3.1 MB" | download circle icon right
Item 3: Video play icon (accent blue) left | "Video: Metode Agile & Scrum" / "Dr. Ida Bagus Dharma · 45 min" | download circle icon right
Item 4: PDF icon (blue) left | "Modul 3 - Manajemen Risiko" / "Dr. Ida Bagus Dharma · 1.8 MB" | download circle icon right
Item 5: Video play icon (accent blue) left | "Video: Studi Kasus Proyek Nyata" / "Dr. Ida Bagus Dharma · 30 min" | download circle icon right

=== SCREEN 3: KUIS (QUIZ) ===
Show 2 states side by side OR as separate screens:

STATE A — Quiz List:
Top header: #0D3B66, white text "Kuis Aktif"
3 quiz cards in vertical list, white background, 16px corner radius, soft shadow:
- Quiz 1: "Kuis Bab 1 & 2" | badge "Aktif" green | metadata "10 Soal · 30 Menit" | blue "Mulai Kuis" button
- Quiz 2: "Kuis Tengah Semester" | badge "Aktif" green | metadata "25 Soal · 60 Menit" | blue "Mulai Kuis" button  
- Quiz 3: "Kuis Bab 3" | badge "Selesai" grey | metadata "15 Soal · 20 Menit" | grey "Lihat Nilai" button

STATE B — Quiz Active/Exam:
Top bar locked (full width): background #4A90E2, white text "Sisa Waktu: 24:35", countdown timer centered, bold
Question number: "Soal 3 dari 10" (caption)
Large white card (single question card):
- Question text: "Apa yang dimaksud dengan Work Breakdown Structure (WBS) dalam manajemen proyek?" (14pt Body)
4 answer option cards, vertically stacked:
- Option A: "Dokumen perencanaan anggaran" — white card
- Option B: "Dekomposisi hierarkis lingkup pekerjaan" — selected state, background #0D3B66, white text
- Option C: "Diagram alur komunikasi tim" — white card
- Option D: "Metode penjadwalan proyek" — white card
Bottom: "Soal Selanjutnya →" button, full width, #0D3B66 background, white text, 12px corner radius

=== SCREEN 4: FORUM DISKUSI (DISCUSSION FORUM) ===
Top header: #0D3B66, white text "Forum Diskusi", plus icon or edit icon right
Tab filter bar: "Semua", "MPTI", "RPL", "Basis Data" (pill-shaped tabs, active tab #0D3B66)

4 discussion thread cards, vertical list, white background, 16px corner radius, soft shadow:

Thread 1:
- Profile avatar (initial "BS", circle, #4A90E2 bg) left
- "Budi Santoso" (bold) · "2 jam lalu" (caption)
- Title: "Perbedaan Agile vs Waterfall dalam proyek skala besar?" (14pt, bold)
- Preview: "Halo teman-teman, saya ingin diskusi mengenai pendekatan..." (caption, 2 lines)
- Bottom row: 💬 12 balasan  👍 24

Thread 2:
- Profile avatar "DP" circle avatar
- "Dewi Puspita" · "5 jam lalu"
- Title: "Bagaimana cara membuat WBS yang efektif?"
- Preview: "Saya kesulitan dalam memecah task menjadi sub-task yang..."
- Bottom row: 💬 8 balasan  👍 15

Thread 3:
- Profile avatar "AR"
- "Adi Rahmat" · "1 hari lalu"
- Title: "Tools terbaik untuk manajemen risiko proyek IT?"
- Preview: "Ada yang sudah pernah menggunakan tools seperti Jira atau..."
- Bottom row: 💬 21 balasan  👍 31

FAB Button: Floating Action Button, circle (+), bottom right corner, #0D3B66 background, white + icon, subtle drop shadow

=== DELIVERABLE ===
Make all 4 screens pixel-perfect, consistent, and presentation-ready for a client demo. Use real-looking placeholder content (not Lorem Ipsum). Make it look like a professional Indonesian university mobile app.
