# NØYNAY — Schedule & QR Card

> ตารางเรียนส่วนตัว + QR Card แบบ PWA ใช้งานได้ offline

![version](https://img.shields.io/badge/version-v0.1.2-52C48A?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-ready-52C48A?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## ฟีเจอร์

- **ตารางเรียน** — เพิ่ม/แก้ไข/ลบวิชาได้เอง บันทึกลง localStorage
- **Countdown** — นับถอยหลังถึงคาบต่อไปแบบ real-time
- **Today highlight** — ไฮไลต์วันปัจจุบันและคาบที่กำลังเรียนอยู่ (badge LIVE)
- **QR Card** — การ์ดพลิกได้ ล็อคด้วย PIN (SHA-256)
- **การแจ้งเตือน** — แจ้งก่อนเรียนล่วงหน้า พร้อม vibration
- **Pull-to-refresh** — ดึงลงเพื่อรีเฟรชข้อมูล
- **Dark / Light mode** — sync ข้ามหน้า
- **PWA** — ติดตั้งลง Home Screen, ใช้งาน offline ได้ผ่าน Service Worker

---

## โครงสร้างไฟล์

```
├── index.html       # หน้าตารางเรียนหลัก
├── card.html        # หน้า QR Card
├── script.js        # logic ทั้งหมด
├── style.css        # styles
├── sw.js            # Service Worker (cache + notifications)
├── manifest.json    # PWA manifest
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── images/
    ├── front.png    # หน้าการ์ด
    └── back.png     # หลังการ์ด (QR Code)
```

---

## วิธีใช้งาน

เปิดไฟล์ผ่าน web server (ไม่รองรับ `file://` เพราะใช้ Service Worker)

```bash
# วิธีที่ง่ายที่สุด
npx serve .

# หรือ Python
python -m http.server 8080
```

แล้วเปิด `http://localhost:8080`

---

## การอัปเดต version

แก้ 4 จุดให้ตรงกันทุกครั้ง

| ไฟล์ | จุดที่แก้ |
|---|---|
| `sw.js` | comment บรรทัดแรก |
| `sw.js` | `CACHE_NAME = 'noynay-vX.X.X'` |
| `index.html` | `<span>vX.X.X</span>` ใน footer |
| `card.html` | `<span>vX.X.X</span>` ใน footer |

> เคล็ดลับ: ใช้ Find & Replace (`Ctrl+H`) ค้นหา version เก่าแทนได้ทีเดียวทุกไฟล์

---

## PIN

QR Card ป้องกันด้วย PIN — hash ด้วย **SHA-256** เก็บใน `script.js` ที่ตัวแปร `PIN_HASHES`
ไม่มีการเก็บ PIN ตรงๆ ใน source code

---

## Tech Stack

- Vanilla HTML / CSS / JavaScript — ไม่มี framework
- PWA: Web App Manifest + Service Worker
- Web Notifications API + Vibration API
- Web Crypto API (SHA-256 สำหรับ PIN)
- localStorage สำหรับ persist ข้อมูล

---

## License

MIT © 2026 NØYNAY
