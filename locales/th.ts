// All user-facing Thai copy lives here (CLAUDE.md §8).
export const th = {
  app: {
    name: "หาทะเบียน",
    title: "หาทะเบียน · แอปหาทะเบียนรถหาย",
    description: "ป้ายหลุดหายช่วงน้ำท่วม? ค้นหาหรือแจ้งพบได้ในไม่กี่วินาที",
  },
  home: {
    welcome: "ยินดีต้อนรับสู่",
    heading: "แอปหาทะเบียนรถหาย",
  },
} as const;

export type Copy = typeof th;
