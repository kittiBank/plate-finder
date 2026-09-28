// All user-facing Thai copy lives here (CLAUDE.md §8).
export const th = {
  app: {
    name: "หาทะเบียน",
    title: "หาทะเบียน · แอปหาทะเบียนรถหาย",
    description: "ป้ายหลุดหายช่วงน้ำท่วม? ค้นหาหรือแจ้งพบได้ในไม่กี่วินาที",
  },
  nav: {
    label: "เมนูหลัก",
    home: "หน้าแรก",
    map: "แผนที่",
    myPlates: "ป้ายของฉัน",
  },
  header: {
    notifications: "การแจ้งเตือน",
    notificationsUnread: (count: number) => `การแจ้งเตือน (มี ${count} รายการใหม่)`,
    profile: "โปรไฟล์",
  },
  plate: {
    label: "ป้ายทะเบียน",
    front: "ป้ายหน้า",
    rear: "ป้ายหลัง",
  },
  status: {
    tracking: "กำลังติดตาม",
    found: "มีผู้พบแล้ว",
    waitingOwner: "รอเจ้าของรับคืน",
    recovered: "ได้คืนแล้ว",
  },
  home: {
    welcome: "ยินดีต้อนรับสู่",
    heading: "แอปหาทะเบียนรถหาย",
  },
  myPlates: {
    addLostPlate: "เพิ่มป้ายทะเบียนที่หาย",
  },
} as const;

export type Copy = typeof th;
